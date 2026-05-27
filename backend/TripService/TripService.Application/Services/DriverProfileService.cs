namespace TripService.Application.Services;

using TripService.Application.DTOs;
using TripService.Application.Interfaces;
using TripService.Domain.Entities;

public class DriverProfileService : IDriverProfileService
{
    private readonly IDriverProfileRepository _repository;

    public DriverProfileService(IDriverProfileRepository repository)
    {
        _repository = repository;
    }

    public async Task<DriverProfileDto?> GetDriverProfileAsync(Guid driverId)
    {
        var profile = await _repository.GetByDriverIdAsync(driverId);
        return profile == null ? null : MapToDto(profile);
    }

    public async Task<List<DriverProfileDto>> GetAllDriverProfilesAsync()
    {
        var profiles = await _repository.GetAllAsync();
        return profiles.Select(MapToDto).ToList();
    }

    public async Task<DriverProfileDto> CreateDriverProfileAsync(CreateDriverProfileDto dto)
    {
        // Ensure driver has only one profile
        var existing = await _repository.GetByDriverIdAsync(dto.DriverId);
        if (existing != null)
        {
            throw new InvalidOperationException($"Driver profile already exists for driver {dto.DriverId}");
        }

        var profile = new DriverProfile
        {
            DriverId = dto.DriverId,
            LicenseNumber = dto.LicenseNumber,
            LicenseExpiryDate = dto.LicenseExpiryDate,
            LicenseCategory = dto.LicenseCategory,
            IssuingAuthority = dto.IssuingAuthority,
            VehiclePlateNumber = dto.VehiclePlateNumber,
            VehicleModel = dto.VehicleModel,
            VehicleColor = dto.VehicleColor,
            RegistrationExpiryDate = dto.RegistrationExpiryDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(profile);
        await _repository.SaveChangesAsync();

        return MapToDto(profile);
    }

    public async Task<DriverProfileDto> UpdateDriverProfileAsync(Guid driverId, UpdateDriverProfileDto dto)
    {
        var profile = await _repository.GetByDriverIdAsync(driverId);
        if (profile == null) throw new KeyNotFoundException($"Driver profile not found for {driverId}");

        if (!string.IsNullOrEmpty(dto.LicenseNumber)) profile.LicenseNumber = dto.LicenseNumber;
        if (dto.LicenseExpiryDate.HasValue) profile.LicenseExpiryDate = dto.LicenseExpiryDate.Value;
        if (dto.LicenseCategory.HasValue) profile.LicenseCategory = dto.LicenseCategory.Value;
        if (!string.IsNullOrEmpty(dto.IssuingAuthority)) profile.IssuingAuthority = dto.IssuingAuthority;
        if (!string.IsNullOrEmpty(dto.VehiclePlateNumber)) profile.VehiclePlateNumber = dto.VehiclePlateNumber;
        if (!string.IsNullOrEmpty(dto.VehicleModel)) profile.VehicleModel = dto.VehicleModel;
        if (!string.IsNullOrEmpty(dto.VehicleColor)) profile.VehicleColor = dto.VehicleColor;
        if (dto.RegistrationExpiryDate.HasValue) profile.RegistrationExpiryDate = dto.RegistrationExpiryDate.Value;

        profile.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(profile);
        await _repository.SaveChangesAsync();

        return MapToDto(profile);
    }

    public async Task<bool> DeleteDriverProfileAsync(Guid driverId)
    {
        var profile = await _repository.GetByDriverIdAsync(driverId);
        if (profile == null) return false;

        await _repository.DeleteAsync(profile);
        await _repository.SaveChangesAsync();
        return true;
    }

    private static DriverProfileDto MapToDto(DriverProfile profile) =>
        new()
        {
            Id = profile.Id,
            DriverId = profile.DriverId,
            LicenseNumber = profile.LicenseNumber,
            LicenseExpiryDate = profile.LicenseExpiryDate,
            LicenseCategory = profile.LicenseCategory,
            IssuingAuthority = profile.IssuingAuthority,
            VehiclePlateNumber = profile.VehiclePlateNumber,
            VehicleModel = profile.VehicleModel,
            VehicleColor = profile.VehicleColor,
            RegistrationExpiryDate = profile.RegistrationExpiryDate,
            CreatedAt = profile.CreatedAt,
            UpdatedAt = profile.UpdatedAt
        };
}
