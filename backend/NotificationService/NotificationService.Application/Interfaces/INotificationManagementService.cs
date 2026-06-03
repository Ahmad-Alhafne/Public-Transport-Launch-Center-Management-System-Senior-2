namespace NotificationService.Application.Interfaces;

using NotificationService.Application.DTOs;

public interface INotificationManagementService
{
    Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto);
    Task<NotificationDto> GetNotificationByIdAsync(Guid id);
    Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId, string? role = null);
    Task<int> GetUnreadCountAsync(Guid userId, string? role = null);
    Task<NotificationDto> MarkAsReadAsync(Guid id);
    Task MarkAllAsReadAsync(Guid userId);
    Task DeleteNotificationAsync(Guid id);
}
