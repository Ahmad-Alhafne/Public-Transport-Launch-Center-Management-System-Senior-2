namespace RouteService.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;
using RouteService.Application.Interfaces;
using RouteService.Domain.Entities;
using RouteService.Infrastructure.Data;

public class RouteRepository : IRouteRepository
{
    private readonly RouteDbContext _dbContext;

    public RouteRepository(RouteDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<Route>> GetAllAsync()
    {
        return await _dbContext.Routes.ToListAsync();
    }

    public async Task<Route?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Routes.FindAsync(id);
    }

    public async Task<Route?> GetByNameAsync(string name)
    {
        return await _dbContext.Routes.FirstOrDefaultAsync(r => r.Name == name);
    }

    public async Task<Route?> GetByEndpointsAsync(string startLocation, string endLocation)
    {
        var start = startLocation.Trim().ToLower();
        var end = endLocation.Trim().ToLower();

        return await _dbContext.Routes.FirstOrDefaultAsync(r =>
            r.StartLocation.ToLower() == start &&
            r.EndLocation.ToLower() == end);
    }

    public async Task AddAsync(Route route)
    {
        await _dbContext.Routes.AddAsync(route);
    }

    public Task UpdateAsync(Route route)
    {
        _dbContext.Routes.Update(route);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Route route)
    {
        _dbContext.Routes.Remove(route);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}
