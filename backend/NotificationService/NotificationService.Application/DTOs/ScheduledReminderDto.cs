namespace NotificationService.Application.DTOs;

public class ScheduledReminderDto
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
    public string? TargetRole { get; set; }
    public string TripNumber { get; set; } = string.Empty;
    public string StartLocation { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string? VehicleInfo { get; set; }
    public string? RouteInfo { get; set; }
    public DateTime DepartureTimeUtc { get; set; }
    public DateTime ReminderAtUtc { get; set; }
    public bool Processed { get; set; }
}
