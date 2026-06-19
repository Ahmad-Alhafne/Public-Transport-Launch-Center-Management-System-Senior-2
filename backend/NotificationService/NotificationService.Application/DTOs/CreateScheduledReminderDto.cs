namespace NotificationService.Application.DTOs;

public class CreateScheduledReminderDto
{
    public Guid TripId { get; set; }
    public string TripNumber { get; set; } = string.Empty;
    public DateTime DepartureTimeUtc { get; set; }
    public string? VehicleInfo { get; set; }
    public string? RouteInfo { get; set; }
    public string StartLocation { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public int ReminderMinutesBeforeDeparture { get; set; }
    public string? TargetRole { get; set; }
}
