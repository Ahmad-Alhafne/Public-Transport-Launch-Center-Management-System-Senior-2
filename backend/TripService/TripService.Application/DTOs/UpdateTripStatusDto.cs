namespace TripService.Application.DTOs;

using TripService.Domain.Enums;

public class UpdateTripStatusDto
{
    public TripStatus Status { get; set; }
    public int? DelayMinutes { get; set; }
    public string? DelayReason { get; set; }
    public string? AdminContact { get; set; }
}
