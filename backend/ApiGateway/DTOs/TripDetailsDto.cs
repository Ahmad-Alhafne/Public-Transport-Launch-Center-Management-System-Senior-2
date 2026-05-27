namespace ApiGateway.DTOs;

public class TripDetailsDto
{
    public Guid Id { get; set; }
    public Guid RouteId { get; set; }
    public string RouteSource { get; set; } = string.Empty;
    public string RouteDestination { get; set; } = string.Empty;
    public Guid DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string? DriverPhone { get; set; }
    public string BusNumber { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public DateTime? ArrivalTime { get; set; }
    public int TotalSeats { get; set; }
    public int Status { get; set; }
    public List<PassengerDto> Passengers { get; set; } = new();
    public SeatUsageSummaryDto SeatUsage { get; set; } = new();
}

public class PassengerDto
{
    public Guid PassengerId { get; set; }
    public string PassengerName { get; set; } = string.Empty;
    public string? PassengerPhone { get; set; }
    public int SeatCount { get; set; }
    public DateTime BookedAt { get; set; }
    public int Status { get; set; } // BookingStatus
}

public class SeatUsageSummaryDto
{
    public int TotalSeats { get; set; }
    public int ReservedSeats { get; set; }
    public int AvailableSeats { get; set; }
    public double OccupancyPercentage { get; set; }
}
