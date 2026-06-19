using System;

namespace LiveTrackingService.Application.IntegrationEvents;

public class TrackingStoppedEvent : IntegrationEvent
{
    public Guid TripId { get; set; }
    public Guid DriverId { get; set; }
    public Guid VehicleId { get; set; }
    public string Reason { get; set; } = string.Empty;
}
