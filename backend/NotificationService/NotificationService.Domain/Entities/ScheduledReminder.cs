namespace NotificationService.Domain.Entities;

public class ScheduledReminder
{
    public Guid Id { get; set; } = Guid.NewGuid();
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
    public bool Processed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    public string? CorrelationId { get; set; }
}
