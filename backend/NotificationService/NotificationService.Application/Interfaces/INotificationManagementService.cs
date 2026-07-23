namespace NotificationService.Application.Interfaces;

using NotificationService.Application.DTOs;

public interface INotificationManagementService
{
    Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto);
    Task<NotificationDto> GetNotificationByIdAsync(Guid id, Guid userId, string? role = null);
    Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId, string? role = null);
    Task<int> GetUnreadCountAsync(Guid userId, string? role = null);
    Task<NotificationDto> MarkAsReadAsync(Guid id, Guid userId, string? role = null);
    Task MarkAllAsReadAsync(Guid userId, string? role = null);
    Task DeleteNotificationAsync(Guid id, Guid userId);
}
