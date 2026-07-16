using TripService.Domain.Enums;

namespace TripService.Application.DTOs;

public class CreateEmergencyDto
{
    public Guid TripId { get; set; }
    public Guid? BookingId { get; set; }
    public EmergencyType Type { get; set; }
    public EmergencyPriority Priority { get; set; } = EmergencyPriority.Medium;
    public string? Description { get; set; }
}
