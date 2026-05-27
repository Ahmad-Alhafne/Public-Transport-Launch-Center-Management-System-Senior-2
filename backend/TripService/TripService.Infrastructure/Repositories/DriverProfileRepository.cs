namespace TripService.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;
using TripService.Application.Interfaces;
using TripService.Domain.Entities;
using TripService.Infrastructure.Data;

public class DriverProfileRepository : IDriverProfileRepository
{
    private readonly TripDbContext _dbContext;

    public DriverProfileRepository(TripDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<DriverProfile>> GetAllAsync()
    {
        return await _dbContext.DriverProfiles.OrderBy(dp => dp.DriverId).ToListAsync();
    }

    public async Task<DriverProfile?> GetByDriverIdAsync(Guid driverId)
    {
        return await _dbContext.DriverProfiles.FirstOrDefaultAsync(dp => dp.DriverId == driverId);
    }

    public async Task AddAsync(DriverProfile profile)
    {
        await _dbContext.DriverProfiles.AddAsync(profile);
    }

    public Task UpdateAsync(DriverProfile profile)
    {
        _dbContext.DriverProfiles.Update(profile);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(DriverProfile profile)
    {
        _dbContext.DriverProfiles.Remove(profile);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}
