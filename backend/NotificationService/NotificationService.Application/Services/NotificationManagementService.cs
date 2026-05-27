namespace NotificationService.Application.Services;

using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Entities;

public class NotificationManagementService : INotificationManagementService
{
    private readonly INotificationRepository _repository;

    public NotificationManagementService(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto)
    {
        var notification = new Notification
        {
            UserId = dto.UserId,
            TargetRole = dto.TargetRole,
            Title = dto.Title,
            Message = dto.Message,
            Type = dto.Type,
            IsRead = false
        };

        await _repository.AddAsync(notification);
        await _repository.SaveChangesAsync();
        return MapToDto(notification);
    }

    public async Task<NotificationDto> GetNotificationByIdAsync(Guid id)
    {
        var notification = await _repository.GetByIdAsync(id);
        if (notification == null)
            throw new Exception($"Notification with ID {id} not found.");
        return MapToDto(notification);
    }

    public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId, string? role = null)
    {
        var notifications = await _repository.GetByUserIdAsync(userId, role);
        return notifications.OrderByDescending(n => n.CreatedAt).Select(MapToDto);
    }

    public async Task<NotificationDto> MarkAsReadAsync(Guid id)
    {
        var notification = await _repository.GetByIdAsync(id);
        if (notification == null)
            throw new Exception($"Notification with ID {id} not found.");

        notification.IsRead = true;
        await _repository.UpdateAsync(notification);
        await _repository.SaveChangesAsync();
        return MapToDto(notification);
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        var notifications = await _repository.GetByUserIdAsync(userId);
        foreach (var notification in notifications.Where(n => !n.IsRead))
        {
            notification.IsRead = true;
            await _repository.UpdateAsync(notification);
        }
        await _repository.SaveChangesAsync();
    }

    public async Task DeleteNotificationAsync(Guid id)
    {
        await _repository.DeleteAsync(id);
        await _repository.SaveChangesAsync();
    }

    private static NotificationDto MapToDto(Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            UserId = notification.UserId,
            TargetRole = notification.TargetRole,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        };
    }
}
