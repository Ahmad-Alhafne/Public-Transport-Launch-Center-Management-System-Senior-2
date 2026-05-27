namespace TripService.Application.DTOs;

using System.ComponentModel.DataAnnotations;

public class UpdateTripDto
{
    [Required]
    public Guid RouteId { get; set; }

    [Required]
    public Guid DriverId { get; set; }

    [Required]
    public Guid VehicleId { get; set; }

    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string BusNumber { get; set; } = string.Empty;

    [Required]
    public DateTime DepartureTime { get; set; }

    public DateTime? ArrivalTime { get; set; }

    [Required]
    [Range(1, 1000)]
    public int TotalSeats { get; set; }
}
