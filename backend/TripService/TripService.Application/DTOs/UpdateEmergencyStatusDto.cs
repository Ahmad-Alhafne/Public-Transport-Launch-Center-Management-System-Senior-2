using TripService.Domain.Enums;

namespace TripService.Application.DTOs;

public class UpdateEmergencyStatusDto
{
    public EmergencyStatus Status { get; set; }
    public string? Notes { get; set; }
}
