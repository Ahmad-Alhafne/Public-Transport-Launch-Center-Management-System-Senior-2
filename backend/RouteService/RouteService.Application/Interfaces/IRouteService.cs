namespace RouteService.Application.Interfaces;

using RouteService.Application.DTOs;

public interface IRouteService
{
    Task<IEnumerable<RouteDto>> GetAllRoutesAsync();
    Task<RouteDto> GetRouteByIdAsync(Guid id);
    Task<RouteDto> CreateRouteAsync(CreateRouteDto dto);
    Task<RouteDto> UpdateRouteAsync(Guid id, UpdateRouteDto dto);
    Task DeleteRouteAsync(Guid id, string jwtToken);
}
