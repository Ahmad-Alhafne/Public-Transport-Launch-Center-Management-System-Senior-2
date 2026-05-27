namespace AuthService.Application.Services;

using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Domain.Enums;
using BCrypt.Net;

public class UserManagementService : IUserManagementService
{
    private readonly IUserRepository _userRepository;

    public UserManagementService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserSummaryDto>> GetAllUsersAsync()
    {
        // Include all roles; this returns a combined view for admin
        var admins = await _userRepository.GetByRoleAsync(Role.Admin);
        var drivers = await _userRepository.GetByRoleAsync(Role.Driver);
        var citizens = await _userRepository.GetByRoleAsync(Role.Citizen);

        return admins.Concat(drivers).Concat(citizens).Select(MapToSummaryDto);
    }

    public async Task<IEnumerable<UserSummaryDto>> GetUsersByRoleAsync(Role role)
    {
        var users = await _userRepository.GetByRoleAsync(role);
        return users.Select(MapToSummaryDto);
    }

    public async Task<UserSummaryDto?> GetUserByIdAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user == null ? null : MapToSummaryDto(user);
    }

    public async Task<IEnumerable<UserSummaryDto>> GetUsersByIdsAsync(IEnumerable<Guid> ids)
    {
        var users = await _userRepository.GetByIdsAsync(ids);
        return users.Select(MapToSummaryDto);
    }

    public async Task<UserSummaryDto> UpdateUserAsync(Guid id, UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new Exception("User not found.");
        }

        if (!string.IsNullOrEmpty(dto.FullName)) user.FullName = dto.FullName;
        if (!string.IsNullOrEmpty(dto.Email)) user.Email = dto.Email;
        if (!string.IsNullOrEmpty(dto.PhoneNumber)) user.PhoneNumber = dto.PhoneNumber;

        if (!string.IsNullOrEmpty(dto.FirstName)) user.FirstName = dto.FirstName;
        if (!string.IsNullOrEmpty(dto.LastName)) user.LastName = dto.LastName;
        if (!string.IsNullOrEmpty(dto.Gender) && Enum.TryParse<Gender>(dto.Gender, true, out var gender)) user.Gender = gender;
        if (dto.DateOfBirth.HasValue) user.DateOfBirth = dto.DateOfBirth;
        if (!string.IsNullOrEmpty(dto.City)) user.City = dto.City;
        if (!string.IsNullOrEmpty(dto.Region)) user.Region = dto.Region;
        if (!string.IsNullOrEmpty(dto.DisabilityStatus) && Enum.TryParse<DisabilityStatus>(dto.DisabilityStatus, true, out var disability)) user.DisabilityStatus = disability;
        if (!string.IsNullOrEmpty(dto.NationalIdNumber)) user.NationalIdNumber = dto.NationalIdNumber;

        if (!string.IsNullOrEmpty(dto.FatherName)) user.FatherName = dto.FatherName;
        if (!string.IsNullOrEmpty(dto.MotherName)) user.MotherName = dto.MotherName;
        if (!string.IsNullOrEmpty(dto.BirthPlace)) user.BirthPlace = dto.BirthPlace;
        if (!string.IsNullOrEmpty(dto.CurrentAddress)) user.CurrentAddress = dto.CurrentAddress;
        if (!string.IsNullOrEmpty(dto.CardNumber)) user.CardNumber = dto.CardNumber;
        if (dto.CardIssueDate.HasValue) user.CardIssueDate = dto.CardIssueDate;
        if (!string.IsNullOrEmpty(dto.FaceColor)) user.FaceColor = dto.FaceColor;
        if (!string.IsNullOrEmpty(dto.EyeColor)) user.EyeColor = dto.EyeColor;

        if (!string.IsNullOrEmpty(dto.Password))
        {
            user.PasswordHash = BCrypt.HashPassword(dto.Password);
        }

        if (!string.IsNullOrEmpty(dto.Role) && Enum.TryParse<Role>(dto.Role, true, out var role))
        {
            user.Role = role;
        }

        if (!string.IsNullOrEmpty(dto.AccountStatus) && Enum.TryParse<AccountStatus>(dto.AccountStatus, true, out var status))
        {
            user.AccountStatus = status;
        }

        user.LastProfileUpdate = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync();

        return MapToSummaryDto(user);
    }

    public async Task DeleteUserAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new Exception("User not found.");
        }

        _userRepository.Remove(user);
        await _userRepository.SaveChangesAsync();
    }

    public async Task<AdminProfileDto> GetMyProfileAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new Exception("User not found.");
        }

        return new AdminProfileDto
        {
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Gender = user.Gender?.ToString(),
            DateOfBirth = user.DateOfBirth,
            NationalIdNumber = user.NationalIdNumber,
            City = user.City,
            Region = user.Region,
            DisabilityStatus = user.DisabilityStatus?.ToString(),
            FatherName = user.FatherName,
            MotherName = user.MotherName,
            BirthPlace = user.BirthPlace,
            CurrentAddress = user.CurrentAddress,
            AdminLevel = user.AdminLevel,
            AccountStatus = user.AccountStatus.ToString(),
            Role = user.Role.ToString(),
            AccountCreationDate = user.AccountCreationDate,
            LastProfileUpdate = user.LastProfileUpdate
        };
    }

    public async Task<AdminProfileDto> UpdateMyProfileAsync(Guid userId, AdminProfileDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new Exception("User not found.");
        }

        if (!string.IsNullOrEmpty(dto.FullName)) user.FullName = dto.FullName;
        if (!string.IsNullOrEmpty(dto.Email)) user.Email = dto.Email;
        if (!string.IsNullOrEmpty(dto.PhoneNumber)) user.PhoneNumber = dto.PhoneNumber;
        if (!string.IsNullOrEmpty(dto.FirstName)) user.FirstName = dto.FirstName;
        if (!string.IsNullOrEmpty(dto.LastName)) user.LastName = dto.LastName;
        if (!string.IsNullOrEmpty(dto.Password)) user.PasswordHash = BCrypt.HashPassword(dto.Password);

        if (!string.IsNullOrEmpty(dto.Gender) && Enum.TryParse<Gender>(dto.Gender, true, out var gender))
            user.Gender = gender;

        if (dto.DateOfBirth.HasValue) user.DateOfBirth = dto.DateOfBirth;
        if (!string.IsNullOrEmpty(dto.NationalIdNumber)) user.NationalIdNumber = dto.NationalIdNumber;
        if (!string.IsNullOrEmpty(dto.City)) user.City = dto.City;
        if (!string.IsNullOrEmpty(dto.Region)) user.Region = dto.Region;
        if (!string.IsNullOrEmpty(dto.DisabilityStatus) && Enum.TryParse<DisabilityStatus>(dto.DisabilityStatus, true, out var dis))
            user.DisabilityStatus = dis;
        if (!string.IsNullOrEmpty(dto.FatherName)) user.FatherName = dto.FatherName;
        if (!string.IsNullOrEmpty(dto.MotherName)) user.MotherName = dto.MotherName;
        if (!string.IsNullOrEmpty(dto.BirthPlace)) user.BirthPlace = dto.BirthPlace;
        if (!string.IsNullOrEmpty(dto.CurrentAddress)) user.CurrentAddress = dto.CurrentAddress;

        if (!string.IsNullOrEmpty(dto.AccountStatus) && Enum.TryParse<AccountStatus>(dto.AccountStatus, true, out var status))
            user.AccountStatus = status;
        if (dto.AdminLevel.HasValue) user.AdminLevel = dto.AdminLevel;

        user.LastProfileUpdate = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync();

        return new AdminProfileDto
        {
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Gender = user.Gender?.ToString(),
            DateOfBirth = user.DateOfBirth,
            NationalIdNumber = user.NationalIdNumber,
            City = user.City,
            Region = user.Region,
            DisabilityStatus = user.DisabilityStatus?.ToString(),
            FatherName = user.FatherName,
            MotherName = user.MotherName,
            BirthPlace = user.BirthPlace,
            CurrentAddress = user.CurrentAddress,
            AdminLevel = user.AdminLevel,
            AccountStatus = user.AccountStatus.ToString(),
            Role = user.Role.ToString(),
            AccountCreationDate = user.AccountCreationDate,
            LastProfileUpdate = user.LastProfileUpdate
        };
    }

    private static UserSummaryDto MapToSummaryDto(User user)
    {
        return new UserSummaryDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            NationalIdNumber = user.NationalIdNumber,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Gender = user.Gender?.ToString(),
            DateOfBirth = user.DateOfBirth,
            City = user.City,
            Region = user.Region,
            DisabilityStatus = user.DisabilityStatus?.ToString(),
            FatherName = user.FatherName,
            MotherName = user.MotherName,
            BirthPlace = user.BirthPlace,
            CurrentAddress = user.CurrentAddress,
            CardNumber = user.CardNumber,
            CardIssueDate = user.CardIssueDate,
            FaceColor = user.FaceColor,
            EyeColor = user.EyeColor,
            Role = user.Role.ToString(),
            AccountStatus = user.AccountStatus.ToString(),
            CreatedAt = user.CreatedAt
        };
    }
}
