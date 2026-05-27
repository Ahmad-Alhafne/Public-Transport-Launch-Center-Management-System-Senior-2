namespace RouteService.Application.Interfaces;

public interface ITripServiceClient
{
    Task<bool> TripsExistForRouteAsync(Guid routeId, string jwtToken);
}

