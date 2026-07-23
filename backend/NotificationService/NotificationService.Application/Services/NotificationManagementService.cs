namespace NotificationService.Application.Services;

using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Application.IntegrationEvents;
using NotificationService.Domain.Entities;

public class NotificationManagementService : INotificationManagementService
{
    private readonly INotificationRepository _repository;
    private readonly IEnumerable<INotificationChannel> _channels;
    private readonly IRabbitMqEventPublisher _eventPublisher;

    public NotificationManagementService(
        INotificationRepository repository,
        IEnumerable<INotificationChannel> channels,
        IRabbitMqEventPublisher eventPublisher)
    {
        _repository = repository;
        _channels = channels;
        _eventPublisher = eventPublisher;
    }

    public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto)
    {
        if (dto.UserId == Guid.Empty && string.IsNullOrWhiteSpace(dto.TargetRole))
            throw new ArgumentException("A role notification requires TargetRole.");

        var notification = new Notification
        {
            UserId = dto.UserId,
            // A concrete user always means a personal notification, regardless of legacy callers supplying a role.
            TargetRole = dto.UserId == Guid.Empty ? dto.TargetRole : null,
            Title = dto.Title,
            Message = dto.Message,
            Type = dto.Type,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(notification);
        await _repository.SaveChangesAsync();

        foreach (var channel in _channels)
        {
            await channel.SendAsync(notification);
        }

        await _eventPublisher.PublishAsync(new NotificationCreatedEvent
        {
            NotificationId = notification.Id,
            UserId = notification.UserId,
            TargetRole = notification.TargetRole ?? string.Empty,
            Title = notification.Title,
            Message = notification.Message,
            NotificationType = notification.Type.ToString(),
            CreatedAtUtc = notification.CreatedAt
        });

        return MapToDto(notification);
    }

    public async Task<NotificationDto> GetNotificationByIdAsync(Guid id, Guid userId, string? role = null)
    {
        var notification = await _repository.GetByIdForUserAsync(id, userId, role);
        if (notification == null)
            throw new Exception($"Notification with ID {id} not found.");
        return MapToDto(notification);
    }

    public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId, string? role = null)
    {
        var notifications = await _repository.GetByUserIdAsync(userId, role);
        return notifications.Select(MapToDto);
    }

    public async Task<int> GetUnreadCountAsync(Guid userId, string? role = null)
    {
        return await _repository.GetUnreadCountAsync(userId, role);
    }

    public async Task<NotificationDto> MarkAsReadAsync(Guid id, Guid userId, string? role = null)
    {
        var notification = await _repository.GetByIdForUserAsync(id, userId, role);
        if (notification == null)
            throw new Exception($"Notification with ID {id} not found.");

        await _repository.MarkAsReadAsync(notification, userId);
        await _repository.SaveChangesAsync();
        notification.IsRead = true;
        return MapToDto(notification);
    }

    public async Task MarkAllAsReadAsync(Guid userId, string? role = null)
    {
        var notifications = await _repository.GetByUserIdAsync(userId, role);
        foreach (var notification in notifications.Where(n => !n.IsRead))
        {
            await _repository.MarkAsReadAsync(notification, userId);
        }
        await _repository.SaveChangesAsync();
    }

    public async Task DeleteNotificationAsync(Guid id, Guid userId)
    {
        var notification = await _repository.GetByIdForUserAsync(id, userId);
        if (notification == null)
            throw new Exception($"Notification with ID {id} not found.");

        await _repository.DeleteAsync(notification);
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
