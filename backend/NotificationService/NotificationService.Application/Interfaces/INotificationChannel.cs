namespace NotificationService.Application.Interfaces;

using NotificationService.Domain.Entities;

public interface INotificationChannel
{
    string Name { get; }
    Task SendAsync(Notification notification);
}
