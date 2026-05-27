namespace TripService.Application.Interfaces;

public interface IVehicleServiceClient
{
    Task<bool> VehicleExistsAsync(Guid vehicleId, string? jwtToken = null);
}
