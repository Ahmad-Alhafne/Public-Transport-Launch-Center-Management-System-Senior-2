namespace NotificationService.Application.IntegrationEvents;

public class TripBookedEvent : IntegrationEvent
{
    public Guid TripId { get; set; }
    public string TripNumber { get; set; } = string.Empty;
    public Guid CitizenId { get; set; }
    public string StartLocation { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime DepartureTimeUtc { get; set; }
}
