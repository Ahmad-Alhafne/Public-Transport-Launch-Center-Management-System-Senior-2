namespace NotificationService.Application.IntegrationEvents;

public class TripDepartureReminderEvent : IntegrationEvent
{
    public Guid TripId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
    public string TripNumber { get; set; } = string.Empty;
    public string StartLocation { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime DepartureTimeUtc { get; set; }
    public int ReminderMinutesBeforeDeparture { get; set; }
}
