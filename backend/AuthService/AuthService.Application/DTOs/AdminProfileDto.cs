namespace AuthService.Application.DTOs;

using AuthService.Domain.Enums;

public class AdminProfileDto
{
    // Basic identity
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; }
    public string? PhoneNumber { get; set; }

    // Personal info
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? NationalIdNumber { get; set; }
    public string? LanguagePreference { get; set; }

    // Location
    public string? City { get; set; }
    public string? Region { get; set; }
    public string? DisabilityStatus { get; set; }

    // Family & personal
    public string? FatherName { get; set; }
    public string? MotherName { get; set; }
    public string? BirthPlace { get; set; }
    public string? CurrentAddress { get; set; }

    // Admin settings
    public AdminLevel? AdminLevel { get; set; }
    public string? AccountStatus { get; set; }

    // System fields (read-only)
    public string? Role { get; set; }
    public DateTime AccountCreationDate { get; set; }
    public DateTime LastProfileUpdate { get; set; }
}
