using Microsoft.AspNetCore.SignalR;
using LiveTrackingService.Application.DTOs;

namespace LiveTrackingService.Api.Hubs;

public interface ILiveTrackingClient
{
    Task ReceiveLocationUpdate(TrackingDto dto);
}

public class LiveTrackingHub : Hub<ILiveTrackingClient>
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
    // Helper method used by server to push updates
    public async Task PushLocationUpdate(TrackingDto dto)
    {
        await Clients.All.ReceiveLocationUpdate(dto);
    }
}
