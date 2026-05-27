namespace AuthService.Application.DTOs;

public class UpdateDriverDto
{
    // Existing fields
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }

    // Identity fields
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? FatherName { get; set; }
    public string? MotherName { get; set; }
    public string? BirthPlace { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? CurrentAddress { get; set; }
    public string? NationalIdNumber { get; set; }
    public string? CardNumber { get; set; }
    public DateTime? CardIssueDate { get; set; }
    public string? FaceColor { get; set; }
    public string? EyeColor { get; set; }

    // Operational driver fields
    public string? LicenseNumber { get; set; }
    public DateTime? LicenseExpiryDate { get; set; }
    public string? LicenseCategory { get; set; }
    public string? IssuingAuthority { get; set; }
    public string? VehiclePlateNumber { get; set; }
    public string? VehicleModel { get; set; }
    public string? VehicleColor { get; set; }
    public DateTime? RegistrationExpiryDate { get; set; }
}

