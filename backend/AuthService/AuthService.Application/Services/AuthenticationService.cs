namespace AuthService.Application.Services;

using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Domain.Enums;
using BCrypt.Net;

public class AuthenticationService : IAuthenticationService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtProvider _jwtProvider;

    public AuthenticationService(IUserRepository userRepository, IJwtProvider jwtProvider)
    {
        _userRepository = userRepository;
        _jwtProvider = jwtProvider;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Normalize email so it can be compared case-insensitively.
        var normalizedEmail = dto.Email?.Trim().ToLowerInvariant() ?? string.Empty;

        var existingUser = await _userRepository.GetByEmailAsync(normalizedEmail);
        if (existingUser != null)
        {
            throw new Exception("Email already in use.");
        }

        // Parse enums from string values (if provided). If parsing fails, defaults will remain null.
        Gender? gender = null;
        if (!string.IsNullOrWhiteSpace(dto.Gender) && Enum.TryParse<Gender>(dto.Gender, true, out var parsedGender))
        {
            gender = parsedGender;
        }

        DisabilityStatus? disabilityStatus = null;
        if (!string.IsNullOrWhiteSpace(dto.DisabilityStatus) && Enum.TryParse<DisabilityStatus>(dto.DisabilityStatus, true, out var parsedDisability))
        {
            disabilityStatus = parsedDisability;
        }

        var now = DateTime.UtcNow;

        var user = new User
        {
            FullName = dto.FullName,
            Email = normalizedEmail,
            PasswordHash = BCrypt.HashPassword(dto.Password),
            Role = Role.Citizen, // Default role

            PhoneNumber = dto.PhoneNumber,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Gender = gender,
            DateOfBirth = dto.DateOfBirth,
            City = dto.City,
            Region = dto.Region,
            NationalIdNumber = dto.NationalIdNumber,
            DisabilityStatus = disabilityStatus,

            FatherName = dto.FatherName,
            MotherName = dto.MotherName,
            BirthPlace = dto.BirthPlace,
            CurrentAddress = dto.CurrentAddress,
            CardNumber = dto.CardNumber,
            CardIssueDate = dto.CardIssueDate,
            FaceColor = dto.FaceColor,
            EyeColor = dto.EyeColor,

            AccountCreationDate = now,
            LastProfileUpdate = now,
            AccountStatus = AccountStatus.Active
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        var token = _jwtProvider.Generate(user);

        return new AuthResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            LanguagePreference = user.LanguagePreference,
            Token = token
        };
    
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var normalizedEmail = dto.Email?.Trim().ToLowerInvariant() ?? string.Empty;
        var user = await _userRepository.GetByEmailAsync(normalizedEmail);
        if (user == null || !BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new Exception("Invalid credentials.");
        }

        var token = _jwtProvider.Generate(user);

        return new AuthResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            LanguagePreference = user.LanguagePreference,
            Token = token
        };
    }
}
