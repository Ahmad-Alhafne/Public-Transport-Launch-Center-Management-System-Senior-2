using System;

namespace LiveTrackingService.Domain.Entities;

public class LiveTripTracking
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public Guid DriverId { get; set; }
    public Guid VehicleId { get; set; }
    public double CurrentLatitude { get; set; }
    public double CurrentLongitude { get; set; }
    public double? CurrentSpeed { get; set; }
    public DateTime LastUpdatedAt { get; set; }
    public string TrackingStatus { get; set; } = "Inactive";
}
