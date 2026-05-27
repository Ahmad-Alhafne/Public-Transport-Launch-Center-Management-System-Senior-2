namespace TripService.Domain.Entities;

using TripService.Domain.Enums;

public class DriverChangeRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DriverId { get; set; } // Link to AuthService User
    public DriverChangeRequestType Type { get; set; }
    public DriverChangeRequestStatus Status { get; set; } = DriverChangeRequestStatus.Pending;
    public string CurrentValue { get; set; } = string.Empty;
    public string RequestedValue { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? AdminNotes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}
