namespace VehicleService.Application.Interfaces;

using VehicleService.Application.DTOs;

public interface IVehicleService
{
    Task<IEnumerable<VehicleDto>> GetAllVehiclesAsync();
    Task<VehicleDto> GetVehicleByIdAsync(Guid id);
    Task<VehicleDto> CreateVehicleAsync(CreateVehicleDto dto);
    Task<VehicleDto> UpdateVehicleAsync(Guid id, UpdateVehicleDto dto);
    Task DeleteVehicleAsync(Guid id);
}
