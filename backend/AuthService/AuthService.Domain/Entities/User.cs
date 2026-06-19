namespace AuthService.Domain.Entities;

using AuthService.Domain.Enums;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Authentication
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public Role Role { get; set; } = Role.Citizen;

    // System fields
    public DateTime AccountCreationDate { get; set; } = DateTime.UtcNow;
    public DateTime LastProfileUpdate { get; set; } = DateTime.UtcNow;
    public AccountStatus AccountStatus { get; set; } = AccountStatus.Active;

    // Common profile
    public string? PhoneNumber { get; set; }
    public string? NationalIdNumber { get; set; }
    public string LanguagePreference { get; set; } = "ar";

    // Personal identity
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Gender? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public DisabilityStatus? DisabilityStatus { get; set; }

    // Admin-specific
    public AdminLevel? AdminLevel { get; set; }

    // Driver identity fields
    public string? FatherName { get; set; }
    public string? MotherName { get; set; }
    public string? BirthPlace { get; set; }
    public string? CurrentAddress { get; set; }
    public string? CardNumber { get; set; }
    public DateTime? CardIssueDate { get; set; }
    public string? FaceColor { get; set; }
    public string? EyeColor { get; set; }

    // Legacy / compatibility
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
