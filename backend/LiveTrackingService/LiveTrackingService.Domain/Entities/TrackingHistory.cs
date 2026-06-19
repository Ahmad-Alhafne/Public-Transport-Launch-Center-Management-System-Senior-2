using System;

namespace LiveTrackingService.Domain.Entities;

public class TrackingHistory
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double? Speed { get; set; }
    public DateTime Timestamp { get; set; }
}
