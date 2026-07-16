using TripService.Domain.Enums;

namespace TripService.Application.DTOs;

public class EmergencyDto
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string TripBusNumber { get; set; } = string.Empty;
    public TripStatus? TripStatus { get; set; }
    public Guid ReporterId { get; set; }
    public string ReporterRole { get; set; } = string.Empty;
    public EmergencyType Type { get; set; }
    public EmergencyPriority Priority { get; set; }
    public EmergencyStatus Status { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
