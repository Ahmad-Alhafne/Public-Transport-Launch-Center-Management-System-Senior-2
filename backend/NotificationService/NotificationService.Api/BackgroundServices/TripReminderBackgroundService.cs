using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Application.IntegrationEvents;
using NotificationService.Domain.Enums;
using NotificationService.Domain.Entities;

namespace NotificationService.Api.BackgroundServices;

public class TripReminderBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IRabbitMqEventPublisher _eventPublisher;
    private readonly TimeSpan _pollInterval = TimeSpan.FromMinutes(1);

    public TripReminderBackgroundService(IServiceScopeFactory scopeFactory, IRabbitMqEventPublisher eventPublisher)
    {
        _scopeFactory = scopeFactory;
        _eventPublisher = eventPublisher;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessDueRemindersAsync(stoppingToken);
            }
            catch
            {
                // swallow logging at higher level if desired
            }

            await Task.Delay(_pollInterval, stoppingToken);
        }
    }

    private async Task ProcessDueRemindersAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationManagementService>();

        var dueReminders = await repository.GetDueRemindersAsync(DateTime.UtcNow);
        foreach (var reminder in dueReminders)
        {
            if (stoppingToken.IsCancellationRequested)
            {
                break;
            }

            var title = reminder.Role.Equals("Driver", StringComparison.OrdinalIgnoreCase)
                ? $"Reminder: Trip #{reminder.TripNumber} departs soon"
                : $"Reminder: Your trip #{reminder.TripNumber} departs soon";

            var body = reminder.Role.Equals("Driver", StringComparison.OrdinalIgnoreCase)
                ? $"Trip #{reminder.TripNumber} departs at {reminder.DepartureTimeUtc:HH:mm} with {reminder.VehicleInfo}. Route: {reminder.RouteInfo}."
                : $"Your trip from {reminder.StartLocation} to {reminder.Destination} departs at {reminder.DepartureTimeUtc:HH:mm}.";

            await notificationService.CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = reminder.UserId,
                TargetRole = reminder.TargetRole,
                Title = title,
                Message = body,
                Type = NotificationType.TripUpdate
            });

            reminder.Processed = true;
            reminder.ProcessedAt = DateTime.UtcNow;
            await repository.UpdateScheduledReminderAsync(reminder);
            await repository.SaveChangesAsync();

            await _eventPublisher.PublishAsync(new TripDepartureReminderEvent
            {
                TripId = reminder.TripId,
                UserId = reminder.UserId,
                Role = reminder.Role,
                TripNumber = reminder.TripNumber,
                StartLocation = reminder.StartLocation,
                Destination = reminder.Destination,
                DepartureTimeUtc = reminder.DepartureTimeUtc,
                ReminderMinutesBeforeDeparture = (int)(reminder.DepartureTimeUtc - reminder.ReminderAtUtc).TotalMinutes
            });
        }
    }
}
