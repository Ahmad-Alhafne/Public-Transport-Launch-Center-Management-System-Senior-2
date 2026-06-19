namespace BookingService.Domain.Entities;

using BookingService.Domain.Enums;

public class Booking
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TripId { get; set; }
    public Guid PassengerId { get; set; }
    public string PassengerName { get; set; } = string.Empty;
    public int SeatCount { get; set; } = 1;
    public string CancellationCode { get; set; } = Guid.NewGuid().ToString("N")[..8].ToUpper();
    public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
    public DateTime TripDepartureTimeUtc { get; set; }
    public DateTime BookedAt { get; set; } = DateTime.UtcNow;
    // QR token used for boarding verification (signed payload)
    public string? QrToken { get; set; }
    public DateTime? QrGeneratedAt { get; set; }
}
