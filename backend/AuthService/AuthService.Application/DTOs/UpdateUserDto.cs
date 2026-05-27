namespace AuthService.Application.DTOs;

using AuthService.Domain.Enums;

public class UpdateUserDto
{
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }

    // Profile fields
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public string? DisabilityStatus { get; set; }
    public string? NationalIdNumber { get; set; }

    // Role and status
    public string? Role { get; set; }
    public string? AccountStatus { get; set; }

    // Extended profile fields
    public string? FatherName { get; set; }
    public string? MotherName { get; set; }
    public string? BirthPlace { get; set; }
    public string? CurrentAddress { get; set; }
    public string? CardNumber { get; set; }
    public DateTime? CardIssueDate { get; set; }
    public string? FaceColor { get; set; }
    public string? EyeColor { get; set; }

    // Password update (hashed)
    public string? Password { get; set; }
}
