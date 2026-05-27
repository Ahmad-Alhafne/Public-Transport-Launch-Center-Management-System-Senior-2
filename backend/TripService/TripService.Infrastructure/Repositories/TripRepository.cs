namespace TripService.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;
using TripService.Application.Interfaces;
using TripService.Domain.Entities;
using TripService.Infrastructure.Data;

public class TripRepository : ITripRepository
{
    private readonly TripDbContext _dbContext;

    public TripRepository(TripDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<Trip>> GetAllAsync()
    {
        return await _dbContext.Trips.OrderByDescending(t => t.DepartureTime).ToListAsync();
    }

    public async Task<Trip?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Trips.FindAsync(id);
    }

    public async Task<IEnumerable<Trip>> GetByDriverIdAsync(Guid driverId)
    {
        return await _dbContext.Trips.Where(t => t.DriverId == driverId).OrderByDescending(t => t.DepartureTime).ToListAsync();
    }

    public async Task<IEnumerable<Trip>> GetByRouteIdAsync(Guid routeId)
    {
        return await _dbContext.Trips.Where(t => t.RouteId == routeId).ToListAsync();
    }

    public async Task<bool> ExistsByRouteIdAsync(Guid routeId)
    {
        return await _dbContext.Trips.AnyAsync(t => t.RouteId == routeId);
    }

    public async Task<bool> TryDecrementSeatsAsync(Guid tripId, int count)
    {
        // Atomic update to avoid overselling under concurrency.
        var affected = await _dbContext.Trips
            .Where(t => t.Id == tripId && t.AvailableSeats >= count)
            .ExecuteUpdateAsync(setters =>
                setters.SetProperty(t => t.AvailableSeats, t => t.AvailableSeats - count));

        return affected > 0;
    }

    public async Task<bool> TryIncrementSeatsAsync(Guid tripId, int count)
    {
        var affected = await _dbContext.Trips
            .Where(t => t.Id == tripId && (t.AvailableSeats + count) <= t.TotalSeats)
            .ExecuteUpdateAsync(setters =>
                setters.SetProperty(t => t.AvailableSeats, t => t.AvailableSeats + count));

        return affected > 0;
    }

    public async Task AddAsync(Trip trip)
    {
        await _dbContext.Trips.AddAsync(trip);
    }

    public Task UpdateAsync(Trip trip)
    {
        _dbContext.Trips.Update(trip);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Trip trip)
    {
        _dbContext.Trips.Remove(trip);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}
