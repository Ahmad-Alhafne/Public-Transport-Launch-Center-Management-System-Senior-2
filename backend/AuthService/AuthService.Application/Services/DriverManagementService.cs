namespace AuthService.Application.Services;

using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Domain.Enums;
using BCrypt.Net;

public class DriverManagementService : IDriverManagementService
{
    private readonly IUserRepository _userRepository;
    private readonly ITripServiceClient _tripServiceClient;

    public DriverManagementService(IUserRepository userRepository, ITripServiceClient tripServiceClient)
    {
        _userRepository = userRepository;
        _tripServiceClient = tripServiceClient;
    }

    public async Task<UserSummaryDto> CreateDriverAsync(CreateDriverDto dto)
    {
        var existing = await _userRepository.GetByEmailAsync(dto.Email);
        if (existing != null)
        {
            throw new Exception("Email already in use.");
        }

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.HashPassword(dto.Password),
            Role = Role.Driver,
            PhoneNumber = dto.PhoneNumber,

            // Identity fields
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            FatherName = dto.FatherName,
            MotherName = dto.MotherName,
            BirthPlace = dto.BirthPlace,
            DateOfBirth = dto.DateOfBirth,
            CurrentAddress = dto.CurrentAddress,
            NationalIdNumber = dto.NationalIdNumber,
            CardNumber = dto.CardNumber,
            CardIssueDate = dto.CardIssueDate,
            FaceColor = dto.FaceColor,
            EyeColor = dto.EyeColor,

            // System fields
            AccountCreationDate = DateTime.UtcNow,
            LastProfileUpdate = DateTime.UtcNow,
            AccountStatus = AccountStatus.Active
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        // Create driver profile in Trip Service (operational data)
        try
        {
            await _tripServiceClient.CreateDriverProfileAsync(new CreateDriverProfileRequest
            {
                DriverId = user.Id,
                LicenseNumber = dto.LicenseNumber ?? string.Empty,
                LicenseExpiryDate = dto.LicenseExpiryDate ?? DateTime.UtcNow,
                LicenseCategory = dto.LicenseCategory ?? string.Empty,
                IssuingAuthority = dto.IssuingAuthority ?? string.Empty,
                VehiclePlateNumber = dto.VehiclePlateNumber ?? string.Empty,
                VehicleModel = dto.VehicleModel ?? string.Empty,
                VehicleColor = dto.VehicleColor ?? string.Empty,
                RegistrationExpiryDate = dto.RegistrationExpiryDate ?? DateTime.UtcNow
            });
        }
        catch (Exception)
        {
            // Rollback to keep data consistent
            _userRepository.Remove(user);
            await _userRepository.SaveChangesAsync();
            throw;
        }

        return new UserSummaryDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserSummaryDto> UpdateDriverAsync(Guid id, UpdateDriverDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null || user.Role != Role.Driver)
        {
            throw new Exception("Driver not found.");
        }

        user.FullName = dto.FullName;
        user.PhoneNumber = dto.PhoneNumber;

        await _userRepository.SaveChangesAsync();

        // Update the driver profile in Trip Service (if present).
        try
        {
            await _tripServiceClient.UpdateDriverProfileAsync(id, new UpdateDriverProfileRequest
            {
                LicenseNumber = dto.LicenseNumber,
                LicenseExpiryDate = dto.LicenseExpiryDate,
                LicenseCategory = dto.LicenseCategory,
                IssuingAuthority = dto.IssuingAuthority,
                VehiclePlateNumber = dto.VehiclePlateNumber,
                VehicleModel = dto.VehicleModel,
                VehicleColor = dto.VehicleColor,
                RegistrationExpiryDate = dto.RegistrationExpiryDate
            });
        }
        catch
        {
            // Ignored: the profile may not exist yet, or the TripService may be temporarily unavailable.
            // The admin can re-save the details once the profile endpoint is reachable.
        }

        return new UserSummaryDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task DeleteDriverAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null || user.Role != Role.Driver)
        {
            throw new Exception("Driver not found.");
        }

        _userRepository.Remove(user);
        await _userRepository.SaveChangesAsync();
    }

    public async Task<UserSummaryDto> UpdateUserPhoneAsync(Guid id, string phoneNumber)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new Exception("User not found.");
        }

        user.PhoneNumber = phoneNumber;
        await _userRepository.SaveChangesAsync();

        return new UserSummaryDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserSummaryDto> UpdateUserPasswordAsync(Guid id, string newPassword)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new Exception("User not found.");
        }

        user.PasswordHash = BCrypt.HashPassword(newPassword);
        await _userRepository.SaveChangesAsync();

        return new UserSummaryDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            CreatedAt = user.CreatedAt
        };
    }
}

