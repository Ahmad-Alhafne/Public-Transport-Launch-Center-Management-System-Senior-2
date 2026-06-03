using Microsoft.AspNetCore.SignalR;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Entities;
using NotificationService.Api.Hubs;

namespace NotificationService.Api.Channels;

public class InAppNotificationChannel : INotificationChannel
{
    private readonly IHubContext<NotificationHub, INotificationClient> _hubContext;

    public InAppNotificationChannel(IHubContext<NotificationHub, INotificationClient> hubContext)
    {
        _hubContext = hubContext;
    }

    public string Name => "InApp";

    public async Task SendAsync(Notification notification)
    {
        if (notification.UserId == Guid.Empty)
        {
            return;
        }

        var group = NotificationHub.GetUserGroup(notification.UserId.ToString());
        await _hubContext.Clients.Group(group).ReceiveNotification(new NotificationService.Application.DTOs.NotificationDto
        {
            Id = notification.Id,
            UserId = notification.UserId,
            TargetRole = notification.TargetRole,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        });
    }
}
