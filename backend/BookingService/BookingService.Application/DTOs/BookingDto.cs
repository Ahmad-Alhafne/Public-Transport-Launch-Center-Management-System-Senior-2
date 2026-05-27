namespace BookingService.Application.DTOs;

using BookingService.Domain.Enums;

public class BookingDto
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public Guid PassengerId { get; set; }
    public string PassengerName { get; set; } = string.Empty;
    public int SeatCount { get; set; }
    public string CancellationCode { get; set; } = string.Empty;
    public BookingStatus Status { get; set; }

    // Trip status data (kept in sync via polling)
    public string? TripStatus { get; set; }
    public int? TripDelayMinutes { get; set; }
    public DateTime TripDepartureTimeUtc { get; set; }
    public DateTime BookedAt { get; set; }
}
