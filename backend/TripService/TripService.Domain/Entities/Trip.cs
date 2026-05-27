namespace TripService.Domain.Entities;

using TripService.Domain.Enums;

public class Trip
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RouteId { get; set; }
    public Guid DriverId { get; set; }
    public Guid VehicleId { get; set; }
    public string BusNumber { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public DateTime? ArrivalTime { get; set; }
    public int TotalSeats { get; set; }
    public int AvailableSeats { get; set; }
    public TripStatus Status { get; set; } = TripStatus.Scheduled;
    public int? DelayMinutes { get; set; }
    public string? DelayReason { get; set; }
    public string? AdminContact { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
