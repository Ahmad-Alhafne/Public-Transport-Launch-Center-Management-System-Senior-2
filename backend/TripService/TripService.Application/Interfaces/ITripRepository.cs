namespace TripService.Application.Interfaces;

using TripService.Domain.Entities;

public interface ITripRepository
{
    Task<IEnumerable<Trip>> GetAllAsync();
    Task<Trip?> GetByIdAsync(Guid id);
    Task<IEnumerable<Trip>> GetByDriverIdAsync(Guid driverId);
    Task<IEnumerable<Trip>> GetByRouteIdAsync(Guid routeId);
    Task<bool> ExistsByRouteIdAsync(Guid routeId);
    Task<bool> TryDecrementSeatsAsync(Guid tripId, int count);
    Task<bool> TryIncrementSeatsAsync(Guid tripId, int count);
    Task AddAsync(Trip trip);
    Task UpdateAsync(Trip trip);
    Task DeleteAsync(Trip trip);
    Task SaveChangesAsync();
}
