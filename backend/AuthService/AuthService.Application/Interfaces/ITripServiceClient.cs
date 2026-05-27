namespace AuthService.Application.Interfaces;

public interface ITripServiceClient
{
    Task CreateDriverProfileAsync(CreateDriverProfileRequest dto);
    Task UpdateDriverProfileAsync(Guid driverId, UpdateDriverProfileRequest dto);
}

public class CreateDriverProfileRequest
{
    public Guid DriverId { get; set; }

    public string LicenseNumber { get; set; } = string.Empty;
    public DateTime LicenseExpiryDate { get; set; }
    public string LicenseCategory { get; set; } = string.Empty;
    public string IssuingAuthority { get; set; } = string.Empty;

    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string VehicleColor { get; set; } = string.Empty;
    public DateTime RegistrationExpiryDate { get; set; }
}

public class UpdateDriverProfileRequest
{
    public string? LicenseNumber { get; set; }
    public DateTime? LicenseExpiryDate { get; set; }
    public string? LicenseCategory { get; set; }
    public string? IssuingAuthority { get; set; }

    public string? VehiclePlateNumber { get; set; }
    public string? VehicleModel { get; set; }
    public string? VehicleColor { get; set; }
    public DateTime? RegistrationExpiryDate { get; set; }
}
