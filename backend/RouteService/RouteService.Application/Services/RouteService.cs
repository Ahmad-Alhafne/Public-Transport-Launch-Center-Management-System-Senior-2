namespace RouteService.Application.Services;

using RouteService.Application.DTOs;
using RouteService.Application.Interfaces;
using RouteService.Domain.Entities;

public class RouteManagementService : IRouteService
{
    private readonly IRouteRepository _repository;
    private readonly ITripServiceClient _tripServiceClient;

    public RouteManagementService(IRouteRepository repository, ITripServiceClient tripServiceClient)
    {
        _repository = repository;
        _tripServiceClient = tripServiceClient;
    }

    public async Task<IEnumerable<RouteDto>> GetAllRoutesAsync()
    {
        var routes = await _repository.GetAllAsync();
        return routes.Select(MapToDto);
    }

    public async Task<RouteDto> GetRouteByIdAsync(Guid id)
    {
        var route = await _repository.GetByIdAsync(id);
        if (route == null)
            throw new Exception($"Route with ID {id} not found.");

        return MapToDto(route);
    }

    public async Task<RouteDto> CreateRouteAsync(CreateRouteDto dto)
    {
        var existing = await _repository.GetByNameAsync(dto.Name);
        if (existing != null)
            throw new Exception($"Route with name '{dto.Name}' already exists.");

        var existingEndpoints = await _repository.GetByEndpointsAsync(dto.StartLocation, dto.EndLocation);
        if (existingEndpoints != null)
            throw new Exception("Route with same start and destination already exists.");

        var route = new Route
        {
            Name = dto.Name,
            StartLocation = dto.StartLocation,
            EndLocation = dto.EndLocation,
            DistanceKm = dto.DistanceKm,
            EstimatedDurationMins = dto.EstimatedDurationMins,
            IsActive = true
        };

        await _repository.AddAsync(route);
        await _repository.SaveChangesAsync();

        return MapToDto(route);
    }

    public async Task<RouteDto> UpdateRouteAsync(Guid id, UpdateRouteDto dto)
    {
        var route = await _repository.GetByIdAsync(id);
        if (route == null)
            throw new Exception($"Route with ID {id} not found.");

        var existingName = await _repository.GetByNameAsync(dto.Name);
        if (existingName != null && existingName.Id != id)
            throw new Exception($"Another route with name '{dto.Name}' already exists.");

        var existingEndpoints = await _repository.GetByEndpointsAsync(dto.StartLocation, dto.EndLocation);
        if (existingEndpoints != null && existingEndpoints.Id != id)
            throw new Exception("Route with same start and destination already exists.");

        route.Name = dto.Name;
        route.StartLocation = dto.StartLocation;
        route.EndLocation = dto.EndLocation;
        route.DistanceKm = dto.DistanceKm;
        route.EstimatedDurationMins = dto.EstimatedDurationMins;
        route.IsActive = dto.IsActive;

        await _repository.UpdateAsync(route);
        await _repository.SaveChangesAsync();

        return MapToDto(route);
    }

    public async Task DeleteRouteAsync(Guid id, string jwtToken)
    {
        var route = await _repository.GetByIdAsync(id);
        if (route == null)
            throw new Exception($"Route with ID {id} not found.");

        var hasTrips = await _tripServiceClient.TripsExistForRouteAsync(id, jwtToken);
        if (hasTrips)
            throw new Exception("Cannot delete route with associated trips.");

        await _repository.DeleteAsync(route);
        await _repository.SaveChangesAsync();
    }

    private static RouteDto MapToDto(Route route)
    {
        return new RouteDto
        {
            Id = route.Id,
            Name = route.Name,
            StartLocation = route.StartLocation,
            EndLocation = route.EndLocation,
            DistanceKm = route.DistanceKm,
            EstimatedDurationMins = route.EstimatedDurationMins,
            IsActive = route.IsActive
        };
    }
}
