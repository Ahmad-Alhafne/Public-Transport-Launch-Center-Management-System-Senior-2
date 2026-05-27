namespace VehicleService.Application.DTOs;

using System.ComponentModel.DataAnnotations;
using VehicleService.Domain.Enums;

public class CreateVehicleDto
{
    [Required]
    [StringLength(150, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Type { get; set; } = string.Empty;

    [Required]
    [Range(1, 999)]
    public int Capacity { get; set; }

    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string PlateNumber { get; set; } = string.Empty;

    public VehicleStatus Status { get; set; } = VehicleStatus.Active;
}
