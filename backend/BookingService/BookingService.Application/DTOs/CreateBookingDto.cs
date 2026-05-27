namespace BookingService.Application.DTOs;

public class CreateBookingDto
{
    public Guid TripId { get; set; }
    public string PassengerName { get; set; } = string.Empty;
    public int SeatCount { get; set; } = 1;
}
