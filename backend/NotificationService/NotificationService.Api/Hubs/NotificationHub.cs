using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Application.DTOs;

namespace NotificationService.Api.Hubs;

public interface INotificationClient
{
    Task ReceiveNotification(NotificationDto notification);
}

[Authorize]
public class NotificationHub : Hub<INotificationClient>
{
    public override async Task OnConnectedAsync()
    {
        if (!string.IsNullOrEmpty(Context.UserIdentifier))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GetUserGroup(Context.UserIdentifier));
        }

        var role = Context.User?.FindFirstValue(ClaimTypes.Role);
        if (!string.IsNullOrWhiteSpace(role))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GetRoleGroup(role));
        }

        await base.OnConnectedAsync();
    }

    public static string GetUserGroup(string userId) => $"user:{userId}";
    public static string GetRoleGroup(string role) => $"role:{role.ToLowerInvariant()}";
}
