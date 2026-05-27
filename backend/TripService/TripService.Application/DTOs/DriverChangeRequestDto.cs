namespace TripService.Application.DTOs;

public class DriverChangeRequestDto
{
    public Guid Id { get; set; }
    public Guid DriverId { get; set; }
    public int Type { get; set; }
    public int Status { get; set; }
    public string CurrentValue { get; set; } = string.Empty;
    public string RequestedValue { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? AdminNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}

public class CreateDriverChangeRequestDto
{
    public int Type { get; set; } // DriverChangeRequestType enum value
    public string CurrentValue { get; set; } = string.Empty;
    public string RequestedValue { get; set; } = string.Empty;
    public string? Reason { get; set; }
}

public class UpdateDriverChangeRequestStatusDto
{
    public int Status { get; set; } // DriverChangeRequestStatus enum value
    public string? AdminNotes { get; set; }
}
