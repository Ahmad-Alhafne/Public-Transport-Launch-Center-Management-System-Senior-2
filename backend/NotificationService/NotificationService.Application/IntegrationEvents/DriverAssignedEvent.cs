namespace NotificationService.Application.IntegrationEvents;

public class DriverAssignedEvent : IntegrationEvent
{
    public Guid TripId { get; set; }
    public string TripNumber { get; set; } = string.Empty;
    public Guid DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string VehicleInfo { get; set; } = string.Empty;
    public string RouteInfo { get; set; } = string.Empty;
    public DateTime DepartureTimeUtc { get; set; }
}
