using Microsoft.AspNetCore.SignalR;
using NotificationService.Application.DTOs;

namespace NotificationService.Api.Hubs;

public interface INotificationClient
{
    Task ReceiveNotification(NotificationDto notification);
}

public class NotificationHub : Hub<INotificationClient>
{
    public override async Task OnConnectedAsync()
    {
        if (!string.IsNullOrEmpty(Context.UserIdentifier))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GetUserGroup(Context.UserIdentifier));
        }

        await base.OnConnectedAsync();
    }

    public static string GetUserGroup(string userId) => $"user:{userId}";
}
