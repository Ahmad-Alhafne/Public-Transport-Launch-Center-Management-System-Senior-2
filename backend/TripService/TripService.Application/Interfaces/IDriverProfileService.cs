namespace TripService.Application.Interfaces;

using TripService.Application.DTOs;

public interface IDriverProfileService
{
    Task<DriverProfileDto?> GetDriverProfileAsync(Guid driverId);
    Task<List<DriverProfileDto>> GetAllDriverProfilesAsync();
    Task<DriverProfileDto> CreateDriverProfileAsync(CreateDriverProfileDto dto);
    Task<DriverProfileDto> UpdateDriverProfileAsync(Guid driverId, UpdateDriverProfileDto dto);
    Task<bool> DeleteDriverProfileAsync(Guid driverId);
}
