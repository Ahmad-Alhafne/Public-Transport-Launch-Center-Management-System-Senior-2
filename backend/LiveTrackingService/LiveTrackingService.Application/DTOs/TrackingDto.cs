using System;

namespace LiveTrackingService.Application.DTOs;

public class TrackingDto
{
    public Guid TripId { get; set; }
    public Guid DriverId { get; set; }
    public Guid VehicleId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double? Speed { get; set; }
    public DateTime Timestamp { get; set; }
    public string? TrackingStatus { get; set; }
}
