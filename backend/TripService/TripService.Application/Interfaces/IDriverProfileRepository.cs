namespace TripService.Application.Interfaces;

using TripService.Domain.Entities;

public interface IDriverProfileRepository
{
    Task<DriverProfile?> GetByDriverIdAsync(Guid driverId);
    Task<IEnumerable<DriverProfile>> GetAllAsync();
    Task AddAsync(DriverProfile profile);
    Task UpdateAsync(DriverProfile profile);
    Task DeleteAsync(DriverProfile profile);
    Task SaveChangesAsync();
}
