namespace AuthService.Application.DTOs;

public class UserSummaryDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? NationalIdNumber { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public string? DisabilityStatus { get; set; }
    public string? FatherName { get; set; }
    public string? MotherName { get; set; }
    public string? BirthPlace { get; set; }
    public string? CurrentAddress { get; set; }
    public string? CardNumber { get; set; }
    public DateTime? CardIssueDate { get; set; }
    public string? FaceColor { get; set; }
    public string? EyeColor { get; set; }
    public string? LanguagePreference { get; set; }

    public string Role { get; set; } = string.Empty;
    public string AccountStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

