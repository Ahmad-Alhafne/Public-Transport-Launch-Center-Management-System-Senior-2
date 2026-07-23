namespace NotificationService.Application.Services;

using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Entities;

public class ReminderService : IReminderService
{
    private readonly INotificationRepository _repository;

    public ReminderService(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<ScheduledReminderDto?> GetReminderAsync(Guid tripId, Guid userId, string role)
    {
        var reminder = await _repository.GetScheduledReminderAsync(tripId, userId, role);
        if (reminder == null) return null;
        return Map(reminder);
    }

    public async Task<ScheduledReminderDto> CreateOrUpdateReminderAsync(CreateScheduledReminderDto dto, Guid userId, string role)
    {
        var existing = await _repository.GetScheduledReminderAsync(dto.TripId, userId, role);
        var reminderAt = dto.DepartureTimeUtc.AddMinutes(-dto.ReminderMinutesBeforeDeparture);
        if (existing == null)
        {
            var entity = new ScheduledReminder
            {
                TripId = dto.TripId,
                UserId = userId,
                Role = role,
                TargetRole = null,
                TripNumber = dto.TripNumber,
                StartLocation = dto.StartLocation,
                Destination = dto.Destination,
                VehicleInfo = dto.VehicleInfo,
                RouteInfo = dto.RouteInfo,
                DepartureTimeUtc = dto.DepartureTimeUtc,
                ReminderAtUtc = reminderAt,
                Processed = false
            };
            await _repository.AddScheduledReminderAsync(entity);
            await _repository.SaveChangesAsync();
            return Map(entity);
        }
        else
        {
            existing.ReminderAtUtc = reminderAt;
            existing.DepartureTimeUtc = dto.DepartureTimeUtc;
            existing.TripNumber = dto.TripNumber;
            existing.VehicleInfo = dto.VehicleInfo;
            existing.RouteInfo = dto.RouteInfo;
            existing.StartLocation = dto.StartLocation;
            existing.Destination = dto.Destination;
            existing.TargetRole = null;
            await _repository.UpdateScheduledReminderAsync(existing);
            await _repository.SaveChangesAsync();
            return Map(existing);
        }
    }

    public async Task DeleteReminderAsync(Guid tripId, Guid userId, string role)
    {
        var existing = await _repository.GetScheduledReminderAsync(tripId, userId, role);
        if (existing != null)
        {
            existing.Processed = true; // mark processed so it won't fire
            await _repository.UpdateScheduledReminderAsync(existing);
            await _repository.SaveChangesAsync();
        }
    }

    private static ScheduledReminderDto Map(ScheduledReminder s) => new ScheduledReminderDto
    {
        Id = s.Id,
        TripId = s.TripId,
        UserId = s.UserId,
        Role = s.Role,
        TargetRole = s.TargetRole,
        TripNumber = s.TripNumber,
        StartLocation = s.StartLocation,
        Destination = s.Destination,
        VehicleInfo = s.VehicleInfo,
        RouteInfo = s.RouteInfo,
        DepartureTimeUtc = s.DepartureTimeUtc,
        ReminderAtUtc = s.ReminderAtUtc,
        Processed = s.Processed
    };
}
