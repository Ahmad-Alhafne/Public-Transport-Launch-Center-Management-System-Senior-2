namespace VehicleService.Domain.Entities;

using VehicleService.Domain.Enums;

public class Vehicle
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public VehicleStatus Status { get; set; } = VehicleStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
