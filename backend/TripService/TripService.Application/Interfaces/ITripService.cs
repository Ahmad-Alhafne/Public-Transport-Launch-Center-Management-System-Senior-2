namespace TripService.Application.Interfaces;

using TripService.Application.DTOs;

public interface ITripService
{
    Task<IEnumerable<TripDto>> GetAllTripsAsync();
    Task<TripDto> GetTripByIdAsync(Guid id);
    Task<IEnumerable<TripDto>> GetTripsByDriverIdAsync(Guid driverId);
    Task<IEnumerable<TripDto>> GetTripsByRouteIdAsync(Guid routeId);
    Task<IEnumerable<TripDto>> GetActiveTripsAsync();
    Task<IEnumerable<TripDto>> GetTripHistoryAsync(int daysBack = 7);
    Task<IEnumerable<TripDto>> GetDriverTripHistoryAsync(Guid driverId, int daysBack = 7);
    Task<bool> TripsExistForRouteAsync(Guid routeId);
    Task<TripDto> CreateTripAsync(CreateTripDto dto, string? jwtToken = null);
    Task<TripDto> UpdateTripAsync(Guid id, UpdateTripDto dto, string? jwtToken = null);
    Task<TripDto> UpdateTripStatusAsync(Guid id, UpdateTripStatusDto dto, string? jwtToken = null);
    Task DeleteTripAsync(Guid id);
    Task<bool> DecrementSeatAsync(Guid tripId);
    Task<bool> IncrementSeatAsync(Guid tripId);
    Task<bool> DecrementSeatsAsync(Guid tripId, int count);
    Task<bool> IncrementSeatsAsync(Guid tripId, int count);
}
