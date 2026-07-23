using System.Text.Json;
using Microsoft.Extensions.Logging;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Application.IntegrationEvents;
using NotificationService.Api.Clients;
using NotificationService.Domain.Entities;
using NotificationService.Domain.Enums;

namespace NotificationService.Api.Handlers;

public class NotificationIntegrationEventHandler
{
    private readonly INotificationManagementService _notificationService;
    private readonly INotificationPreferenceService _preferenceService;
    private readonly INotificationRepository _repository;
    private readonly INotificationTemplateService _templateService;
    private readonly IAuthServiceClient _authServiceClient;
    private readonly ILogger<NotificationIntegrationEventHandler> _logger;

    public NotificationIntegrationEventHandler(
        INotificationManagementService notificationService,
        INotificationPreferenceService preferenceService,
        INotificationRepository repository,
        INotificationTemplateService templateService,
        IAuthServiceClient authServiceClient,
        ILogger<NotificationIntegrationEventHandler> logger)
    {
        _notificationService = notificationService;
        _preferenceService = preferenceService;
        _repository = repository;
        _templateService = templateService;
        _authServiceClient = authServiceClient;
        _logger = logger;
    }

    public async Task HandleAsync(string eventType, string payload)
    {
        if (string.IsNullOrWhiteSpace(eventType) || string.IsNullOrWhiteSpace(payload))
        {
            return;
        }

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        switch (eventType)
        {
            case nameof(TripBookedEvent):
                await HandleTripBookedAsync(JsonSerializer.Deserialize<TripBookedEvent>(payload, options));
                break;
            case nameof(DriverAssignedEvent):
                await HandleDriverAssignedAsync(JsonSerializer.Deserialize<DriverAssignedEvent>(payload, options));
                break;
            case nameof(ComplaintResponseEvent):
                await HandleComplaintResponseAsync(JsonSerializer.Deserialize<ComplaintResponseEvent>(payload, options));
                break;
            case nameof(FavoriteRouteMatchedEvent):
                await HandleFavoriteRouteMatchedAsync(JsonSerializer.Deserialize<FavoriteRouteMatchedEvent>(payload, options));
                break;
            case nameof(PaymentSuccessfulEvent):
                var evt = JsonSerializer.Deserialize<PaymentSuccessfulEvent>(payload, options);
                _logger.LogInformation("Received PaymentSuccessfulEvent payload: {PayloadJson}", payload);
                await HandlePaymentSuccessfulAsync(evt);
                break;
            case nameof(PaymentRefundedEvent):
                var refundEvt = JsonSerializer.Deserialize<PaymentRefundedEvent>(payload, options);
                _logger.LogInformation("Received PaymentRefundedEvent payload: {PayloadJson}", payload);
                await HandlePaymentRefundedAsync(refundEvt);
                break;
        }
    }

    private async Task HandleTripBookedAsync(TripBookedEvent? eventPayload)
    {
        if (eventPayload == null)
        {
            return;
        }

        var preference = await _preferenceService.GetPreferencesAsync(eventPayload.CitizenId, "Citizen");
        if (!preference.ReminderEnabled)
        {
            return;
        }

        var reminderAtUtc = eventPayload.DepartureTimeUtc.AddMinutes(-preference.ReminderMinutesBeforeDeparture);
        if (reminderAtUtc < DateTime.UtcNow)
        {
            reminderAtUtc = DateTime.UtcNow;
        }

        if (await _repository.GetScheduledReminderAsync(eventPayload.TripId, eventPayload.CitizenId, "Citizen") != null)
        {
            return;
        }

        await _repository.AddScheduledReminderAsync(new ScheduledReminder
        {
            TripId = eventPayload.TripId,
            UserId = eventPayload.CitizenId,
            Role = "Citizen",
            TargetRole = null,
            TripNumber = eventPayload.TripNumber,
            StartLocation = eventPayload.StartLocation,
            Destination = eventPayload.Destination,
            DepartureTimeUtc = eventPayload.DepartureTimeUtc,
            ReminderAtUtc = reminderAtUtc,
            CorrelationId = eventPayload.EventId.ToString()
        });

        await _repository.SaveChangesAsync();
    }

    private async Task HandleDriverAssignedAsync(DriverAssignedEvent? eventPayload)
    {
        if (eventPayload == null)
        {
            return;
        }

        var values = new Dictionary<string, string>
        {
            ["TripNumber"] = eventPayload.TripNumber,
            ["DepartureTime"] = eventPayload.DepartureTimeUtc.ToString("HH:mm"),
            ["VehicleInfo"] = eventPayload.VehicleInfo,
            ["RouteInfo"] = eventPayload.RouteInfo
        };

        var (title, body) = await RenderTemplateAsync("DriverAssignment", values);

        await _notificationService.CreateNotificationAsync(new CreateNotificationDto
        {
            UserId = eventPayload.DriverId,
            TargetRole = null,
            Title = title,
            Message = body,
            Type = NotificationType.TripUpdate
        });

        var preference = await _preferenceService.GetPreferencesAsync(eventPayload.DriverId, "Driver");
        if (!preference.ReminderEnabled)
        {
            return;
        }

        var reminderAtUtc = eventPayload.DepartureTimeUtc.AddMinutes(-preference.ReminderMinutesBeforeDeparture);
        if (reminderAtUtc < DateTime.UtcNow)
        {
            reminderAtUtc = DateTime.UtcNow;
        }

        if (await _repository.GetScheduledReminderAsync(eventPayload.TripId, eventPayload.DriverId, "Driver") != null)
        {
            return;
        }

        await _repository.AddScheduledReminderAsync(new ScheduledReminder
        {
            TripId = eventPayload.TripId,
            UserId = eventPayload.DriverId,
            Role = "Driver",
            TargetRole = null,
            TripNumber = eventPayload.TripNumber,
            StartLocation = string.Empty,
            Destination = string.Empty,
            VehicleInfo = eventPayload.VehicleInfo,
            RouteInfo = eventPayload.RouteInfo,
            DepartureTimeUtc = eventPayload.DepartureTimeUtc,
            ReminderAtUtc = reminderAtUtc,
            CorrelationId = eventPayload.EventId.ToString()
        });

        await _repository.SaveChangesAsync();
    }

    private async Task HandleComplaintResponseAsync(ComplaintResponseEvent? eventPayload)
    {
        if (eventPayload == null)
        {
            return;
        }

        var values = new Dictionary<string, string>
        {
            ["ComplaintTitle"] = eventPayload.ComplaintTitle,
            ["ResponseSummary"] = eventPayload.ResponseSummary
        };

        var (title, body) = await RenderTemplateAsync("ComplaintResponse", values);

        await _notificationService.CreateNotificationAsync(new CreateNotificationDto
        {
            UserId = eventPayload.OwnerId,
            TargetRole = null,
            Title = title,
            Message = body,
            Type = NotificationType.ComplaintUpdate
        });
    }

    private async Task HandleFavoriteRouteMatchedAsync(FavoriteRouteMatchedEvent? eventPayload)
    {
        if (eventPayload == null)
        {
            return;
        }

        var values = new Dictionary<string, string>
        {
            ["StartLocation"] = eventPayload.StartLocation,
            ["Destination"] = eventPayload.Destination,
            ["DepartureTime"] = eventPayload.DepartureTimeUtc.ToString("HH:mm")
        };

        var (title, body) = await RenderTemplateAsync("FavoriteRouteMatched", values);

        await _notificationService.CreateNotificationAsync(new CreateNotificationDto
        {
            UserId = eventPayload.CitizenId,
            TargetRole = null,
            Title = title,
            Message = body,
            Type = NotificationType.BookingUpdate
        });
    }

    private async Task HandlePaymentSuccessfulAsync(PaymentSuccessfulEvent? eventPayload)
    {
        if (eventPayload == null)
        {
            return;
        }

        _logger.LogInformation("HandlePaymentSuccessfulAsync received: PaymentId={PaymentId} Amount={Amount} Currency={Currency}", eventPayload.PaymentId, eventPayload.Amount, eventPayload.Currency);

        var language = await GetUserLanguagePreferenceAsync(eventPayload.UserId);
        var isArabic = string.Equals(language, "ar", StringComparison.OrdinalIgnoreCase);

        var amountText = eventPayload.Amount > 0
            ? $"{eventPayload.Currency.ToUpperInvariant()} {eventPayload.Amount:F2}"
            : string.Empty;

        var englishMessage = !string.IsNullOrWhiteSpace(amountText)
            ? $"Your payment of {amountText} has been successfully completed. Thank you."
            : "Your payment has been successfully completed. Thank you.";

        var arabicMessage = !string.IsNullOrWhiteSpace(amountText)
            ? $"تمت عملية الدفع بمبلغ {amountText} بنجاح. شكراً لك."
            : "تمت عملية الدفع بنجاح. شكراً لك.";

        await _notificationService.CreateNotificationAsync(new CreateNotificationDto
        {
            UserId = eventPayload.UserId,
            TargetRole = null,
            Title = isArabic ? "نجاح الدفع" : "Payment Successful",
            Message = isArabic ? arabicMessage : englishMessage,
            Type = NotificationType.PaymentUpdate
        });
    }

    private async Task HandlePaymentRefundedAsync(PaymentRefundedEvent? eventPayload)
    {
        if (eventPayload == null)
        {
            return;
        }

        _logger.LogInformation("HandlePaymentRefundedAsync received: PaymentId={PaymentId} Amount={Amount} Currency={Currency}", eventPayload.PaymentId, eventPayload.Amount, eventPayload.Currency);

        var language = await GetUserLanguagePreferenceAsync(eventPayload.UserId);
        var isArabic = string.Equals(language, "ar", StringComparison.OrdinalIgnoreCase);

        var amountText = eventPayload.Amount > 0
            ? $"{eventPayload.Currency.ToUpperInvariant()} {eventPayload.Amount:F2}"
            : string.Empty;

        var englishMessage = !string.IsNullOrWhiteSpace(amountText)
            ? $"Your refund of {amountText} has been processed. It may take a few business days to appear in your account."
            : "Your refund has been processed. It may take a few business days to appear in your account.";

        var arabicMessage = !string.IsNullOrWhiteSpace(amountText)
            ? $"تمت معالجة استرداد المبلغ {amountText}. قد يستغرق ظهور المبلغ في حسابك عدة أيام عمل."
            : "تمت معالجة الاسترداد. قد يستغرق ظهور المبلغ في حسابك عدة أيام عمل.";

        await _notificationService.CreateNotificationAsync(new CreateNotificationDto
        {
            UserId = eventPayload.UserId,
            TargetRole = null,
            Title = isArabic ? "تمت معالجة الاسترداد" : "Refund Processed",
            Message = isArabic ? arabicMessage : englishMessage,
            Type = NotificationType.PaymentUpdate
        });
    }

    private async Task<string> GetUserLanguagePreferenceAsync(Guid userId)
    {
        var language = await _authServiceClient.GetUserLanguagePreferenceAsync(userId);
        return string.IsNullOrWhiteSpace(language) ? "en" : language.Trim().ToLowerInvariant();
    }

    private async Task<(string title, string body)> RenderTemplateAsync(string key, IDictionary<string, string> values)
    {
        var template = await _templateService.GetTemplateByKeyAsync(key);
        if (template == null)
        {
            throw new InvalidOperationException($"Notification template '{key}' could not be found.");
        }

        var title = ReplaceTemplateTokens(template.TitleTemplate, values);
        var body = ReplaceTemplateTokens(template.BodyTemplate, values);
        return (title, body);
    }

    private static string ReplaceTemplateTokens(string template, IDictionary<string, string> values)
    {
        var result = template;
        foreach (var pair in values)
        {
            result = result.Replace($"{{{pair.Key}}}", pair.Value, StringComparison.OrdinalIgnoreCase);
        }

        return result;
    }
}
