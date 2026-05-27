namespace TripService.Application.DTOs;

using TripService.Domain.Enums;

public class DriverProfileDto
{
    public Guid Id { get; set; }
    public Guid DriverId { get; set; }

    public string LicenseNumber { get; set; } = string.Empty;
    public DateTime LicenseExpiryDate { get; set; }
    public LicenseCategory LicenseCategory { get; set; }
    public string IssuingAuthority { get; set; } = string.Empty;

    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string VehicleColor { get; set; } = string.Empty;
    public DateTime RegistrationExpiryDate { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateDriverProfileDto
{
    public Guid DriverId { get; set; }

    public string LicenseNumber { get; set; } = string.Empty;
    public DateTime LicenseExpiryDate { get; set; }
    public LicenseCategory LicenseCategory { get; set; }
    public string IssuingAuthority { get; set; } = string.Empty;

    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string VehicleColor { get; set; } = string.Empty;
    public DateTime RegistrationExpiryDate { get; set; }
}

public class UpdateDriverProfileDto
{
    public string? LicenseNumber { get; set; }
    public DateTime? LicenseExpiryDate { get; set; }
    public LicenseCategory? LicenseCategory { get; set; }
    public string? IssuingAuthority { get; set; }

    public string? VehiclePlateNumber { get; set; }
    public string? VehicleModel { get; set; }
    public string? VehicleColor { get; set; }
    public DateTime? RegistrationExpiryDate { get; set; }
}
