namespace VehicleService.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;
using VehicleService.Application.Interfaces;
using VehicleService.Domain.Entities;
using VehicleService.Infrastructure.Data;

public class VehicleRepository : IVehicleRepository
{
    private readonly VehicleDbContext _dbContext;

    public VehicleRepository(VehicleDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<Vehicle>> GetAllAsync()
    {
        return await _dbContext.Vehicles.OrderBy(v => v.Name).ToListAsync();
    }

    public async Task<Vehicle?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Vehicles.FindAsync(id);
    }

    public async Task<Vehicle?> GetByPlateNumberAsync(string plateNumber)
    {
        var cleaned = plateNumber.Trim().ToUpperInvariant();
        return await _dbContext.Vehicles.FirstOrDefaultAsync(v => v.PlateNumber == cleaned);
    }

    public async Task AddAsync(Vehicle vehicle)
    {
        await _dbContext.Vehicles.AddAsync(vehicle);
    }

    public Task UpdateAsync(Vehicle vehicle)
    {
        _dbContext.Vehicles.Update(vehicle);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Vehicle vehicle)
    {
        _dbContext.Vehicles.Remove(vehicle);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}
