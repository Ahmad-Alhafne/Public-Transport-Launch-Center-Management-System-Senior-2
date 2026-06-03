namespace NotificationService.Application.Interfaces;

using NotificationService.Application.DTOs;

public interface INotificationPreferenceService
{
    Task<NotificationPreferenceDto> GetPreferencesAsync(Guid userId, string role);
    Task<NotificationPreferenceDto> UpdatePreferencesAsync(Guid userId, string role, UpdateNotificationPreferenceDto dto);
}
