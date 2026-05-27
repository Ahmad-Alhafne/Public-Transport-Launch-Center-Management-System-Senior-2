namespace VehicleService.Application.Services;

using VehicleService.Application.DTOs;
using VehicleService.Application.Interfaces;
using VehicleService.Domain.Entities;
using VehicleService.Domain.Enums;

public class VehicleManagementService : IVehicleService
{
    private readonly IVehicleRepository _repository;

    public VehicleManagementService(IVehicleRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<VehicleDto>> GetAllVehiclesAsync()
    {
        var vehicles = await _repository.GetAllAsync();
        return vehicles.Select(MapToDto);
    }

    public async Task<VehicleDto> GetVehicleByIdAsync(Guid id)
    {
        var vehicle = await _repository.GetByIdAsync(id);
        if (vehicle == null)
            throw new Exception($"Vehicle with ID {id} not found.");

        return MapToDto(vehicle);
    }

    public async Task<VehicleDto> CreateVehicleAsync(CreateVehicleDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Type) || dto.Capacity <= 0 || string.IsNullOrWhiteSpace(dto.PlateNumber))
            throw new Exception("Invalid vehicle payload. Ensure name, type, plate number and capacity are provided.");

        var exists = await _repository.GetByPlateNumberAsync(dto.PlateNumber);
        if (exists != null)
            throw new Exception($"Vehicle with plate number '{dto.PlateNumber}' already exists.");

        var vehicle = new Vehicle
        {
            Name = dto.Name.Trim(),
            Type = dto.Type.Trim(),
            Capacity = dto.Capacity,
            PlateNumber = dto.PlateNumber.Trim().ToUpperInvariant(),
            Status = VehicleStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(vehicle);
        await _repository.SaveChangesAsync();

        return MapToDto(vehicle);
    }

    public async Task<VehicleDto> UpdateVehicleAsync(Guid id, UpdateVehicleDto dto)
    {
        var vehicle = await _repository.GetByIdAsync(id);
        if (vehicle == null)
            throw new Exception($"Vehicle with ID {id} not found.");

        var existingWithPlate = await _repository.GetByPlateNumberAsync(dto.PlateNumber);
        if (existingWithPlate != null && existingWithPlate.Id != id)
            throw new Exception($"Another vehicle with plate number '{dto.PlateNumber}' already exists.");

        vehicle.Name = dto.Name.Trim();
        vehicle.Type = dto.Type.Trim();
        vehicle.Capacity = dto.Capacity;
        vehicle.PlateNumber = dto.PlateNumber.Trim().ToUpperInvariant();
        vehicle.Status = dto.Status;

        await _repository.UpdateAsync(vehicle);
        await _repository.SaveChangesAsync();

        return MapToDto(vehicle);
    }

    public async Task DeleteVehicleAsync(Guid id)
    {
        var vehicle = await _repository.GetByIdAsync(id);
        if (vehicle == null)
            throw new Exception($"Vehicle with ID {id} not found.");

        await _repository.DeleteAsync(vehicle);
        await _repository.SaveChangesAsync();
    }

    private static VehicleDto MapToDto(Vehicle vehicle)
    {
        return new VehicleDto
        {
            Id = vehicle.Id,
            Name = vehicle.Name,
            Type = vehicle.Type,
            Capacity = vehicle.Capacity,
            PlateNumber = vehicle.PlateNumber,
            Status = vehicle.Status,
            CreatedAt = vehicle.CreatedAt
        };
    }
}
