namespace NotificationService.Application.Interfaces;

using NotificationService.Application.DTOs;

public interface IReminderService
{
    Task<ScheduledReminderDto?> GetReminderAsync(Guid tripId, Guid userId, string role);
    Task<ScheduledReminderDto> CreateOrUpdateReminderAsync(CreateScheduledReminderDto dto, Guid userId, string role);
    Task DeleteReminderAsync(Guid tripId, Guid userId, string role);
}
