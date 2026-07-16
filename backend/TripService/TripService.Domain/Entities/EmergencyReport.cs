using TripService.Domain.Enums;

namespace TripService.Domain.Entities;

public class EmergencyReport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TripId { get; set; }
    public Guid ReporterId { get; set; }
    public string ReporterRole { get; set; } = string.Empty; // Driver, Citizen
    public EmergencyType Type { get; set; }
    public EmergencyPriority Priority { get; set; } = EmergencyPriority.Medium;
    public EmergencyStatus Status { get; set; } = EmergencyStatus.Reported;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
