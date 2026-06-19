using System;

namespace LiveTrackingService.Application.IntegrationEvents;

public class LocationUpdatedEvent : IntegrationEvent
{
    public Guid TripId { get; set; }
    public Guid DriverId { get; set; }
    public Guid VehicleId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double? Speed { get; set; }
    public DateTime TimestampUtc { get; set; }
}
