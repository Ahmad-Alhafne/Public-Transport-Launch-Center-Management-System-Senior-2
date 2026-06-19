using System;

namespace LiveTrackingService.Application.IntegrationEvents;

public class TrackingStartedEvent : IntegrationEvent
{
    public Guid TripId { get; set; }
    public Guid DriverId { get; set; }
    public Guid VehicleId { get; set; }
}
