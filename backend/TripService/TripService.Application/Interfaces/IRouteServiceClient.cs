namespace TripService.Application.Interfaces;

public interface IRouteServiceClient
{
    Task<bool> RouteExistsAsync(Guid routeId, string? jwtToken = null);
}