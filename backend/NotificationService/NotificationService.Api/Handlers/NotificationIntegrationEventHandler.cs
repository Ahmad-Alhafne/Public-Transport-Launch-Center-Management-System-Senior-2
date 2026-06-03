using System.Text.Json;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Application.IntegrationEvents;
using NotificationService.Domain.Entities;
using NotificationService.Domain.Enums;

namespace NotificationService.Api.Handlers;

public class NotificationIntegrationEventHandler
{
    private readonly INotificationManagementService _notificationService;
    private readonly INotificationPreferenceService _preferenceService;
    private readonly INotificationRepository _repository;
    private readonly INotificationTemplateService _templateService;

    public NotificationIntegrationEventHandler(
        INotificationManagementService notificationService,
        INotificationPreferenceService preferenceService,
        INotificationRepository repository,
        INotificationTemplateService templateService)
    {
        _notificationService = notificationService;
        _preferenceService = preferenceService;
        _repository = repository;
        _templateService = templateService;
    }

    public async Task HandleAsync(string eventType, string payload)
    {
        if (string.IsNullOrWhiteSpace(eventType) || string.IsNullOrWhiteSpace(payload))
        {
            return;
        }

        switch (eventType)
        {
            case nameof(TripBookedEvent):
                await HandleTripBookedAsync(JsonSerializer.Deserialize<TripBookedEvent>(payload));
                break;
            case nameof(DriverAssignedEvent):
                await HandleDriverAssignedAsync(JsonSerializer.Deserialize<DriverAssignedEvent>(payload));
                break;
            case nameof(ComplaintResponseEvent):
                await HandleComplaintResponseAsync(JsonSerializer.Deserialize<ComplaintResponseEvent>(payload));
                break;
            case nameof(FavoriteRouteMatchedEvent):
                await HandleFavoriteRouteMatchedAsync(JsonSerializer.Deserialize<FavoriteRouteMatchedEvent>(payload));
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
            TargetRole = "Citizen",
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
            TargetRole = "Driver",
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
            TargetRole = "Driver",
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
            TargetRole = eventPayload.OwnerRole,
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
            TargetRole = "Citizen",
            Title = title,
            Message = body,
            Type = NotificationType.BookingUpdate
        });
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
