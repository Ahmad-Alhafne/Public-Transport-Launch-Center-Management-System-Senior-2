namespace VehicleService.Application.DTOs;

using VehicleService.Domain.Enums;

public class VehicleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public VehicleStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
