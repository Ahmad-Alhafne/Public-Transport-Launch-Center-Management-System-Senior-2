namespace RouteService.Application.Interfaces;

using RouteService.Domain.Entities;

public interface IRouteRepository
{
    Task<IEnumerable<Route>> GetAllAsync();
    Task<Route?> GetByIdAsync(Guid id);
    Task<Route?> GetByNameAsync(string name);
    Task<Route?> GetByEndpointsAsync(string startLocation, string endLocation);
    Task AddAsync(Route route);
    Task UpdateAsync(Route route);
    Task DeleteAsync(Route route);
    Task SaveChangesAsync();
}
