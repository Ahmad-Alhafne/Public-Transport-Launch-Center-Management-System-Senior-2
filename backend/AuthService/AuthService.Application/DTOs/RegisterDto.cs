namespace AuthService.Application.DTOs;

public class RegisterDto
{
    // Existing fields
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    // Optional username for future compatibility
    public string? Username { get; set; }

    // Common profile fields
    public string? PhoneNumber { get; set; }

    // Additional profile fields
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public string? DisabilityStatus { get; set; }
    public string? NationalIdNumber { get; set; }

    // Extended profile fields
    public string? FatherName { get; set; }
    public string? MotherName { get; set; }
    public string? BirthPlace { get; set; }
    public string? CurrentAddress { get; set; }
    public string? CardNumber { get; set; }
    public DateTime? CardIssueDate { get; set; }
    public string? FaceColor { get; set; }
    public string? EyeColor { get; set; }
}

