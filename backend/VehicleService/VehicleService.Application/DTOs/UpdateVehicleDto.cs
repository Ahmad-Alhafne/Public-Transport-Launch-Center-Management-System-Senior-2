namespace VehicleService.Application.DTOs;

using System.ComponentModel.DataAnnotations;
using VehicleService.Domain.Enums;

public class UpdateVehicleDto
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

    [Required]
    public VehicleStatus Status { get; set; }
}
