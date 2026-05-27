namespace TripService.Domain.Entities;

using TripService.Domain.Enums;

public class DriverProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Reference to AuthService User.Id
    public Guid DriverId { get; set; }

    // License information
    public string LicenseNumber { get; set; } = string.Empty;
    public DateTime LicenseExpiryDate { get; set; }
    public LicenseCategory LicenseCategory { get; set; }
    public string IssuingAuthority { get; set; } = string.Empty;

    // Vehicle information
    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string VehicleColor { get; set; } = string.Empty;
    public DateTime RegistrationExpiryDate { get; set; }

    // Auditing
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
