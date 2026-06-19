namespace AuthService.Application.Services;

using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Domain.Enums;
using BCrypt.Net;

public class AuditorManagementService : IAuditorManagementService
{
    private readonly IUserRepository _userRepository;

    public AuditorManagementService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserSummaryDto> CreateAuditorAsync(CreateAuditorDto dto)
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
            Role = Role.Auditor,
            PhoneNumber = dto.PhoneNumber,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DateOfBirth = dto.DateOfBirth,
            City = dto.City,
            Region = dto.Region,
            NationalIdNumber = dto.NationalIdNumber,
            // parse gender if provided
            Gender = !string.IsNullOrEmpty(dto.Gender) && Enum.TryParse<Gender>(dto.Gender, true, out var g) ? g : null,
            AccountCreationDate = DateTime.UtcNow,
            LastProfileUpdate = DateTime.UtcNow,
            AccountStatus = AccountStatus.Active
        };

        await _userRepository.AddAsync(user);
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

    public async Task<UserSummaryDto> UpdateAuditorAsync(Guid id, UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null || user.Role != Role.Auditor)
        {
            throw new Exception("Auditor not found.");
        }

        if (!string.IsNullOrEmpty(dto.FullName)) user.FullName = dto.FullName;
        if (!string.IsNullOrEmpty(dto.Email)) user.Email = dto.Email;
        if (!string.IsNullOrEmpty(dto.PhoneNumber)) user.PhoneNumber = dto.PhoneNumber;
        if (!string.IsNullOrEmpty(dto.Password)) user.PasswordHash = BCrypt.HashPassword(dto.Password);
        if (!string.IsNullOrEmpty(dto.AccountStatus) && Enum.TryParse<AccountStatus>(dto.AccountStatus, true, out var status)) user.AccountStatus = status;

        user.LastProfileUpdate = DateTime.UtcNow;
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

    public async Task DeleteAuditorAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null || user.Role != Role.Auditor)
        {
            throw new Exception("Auditor not found.");
        }

        _userRepository.Remove(user);
        await _userRepository.SaveChangesAsync();
    }

    public async Task<UserSummaryDto> UpdateAuditorPasswordAsync(Guid id, string newPassword)
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

    public async Task<UserSummaryDto> UpdateAuditorPhoneAsync(Guid id, string phoneNumber)
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
}
