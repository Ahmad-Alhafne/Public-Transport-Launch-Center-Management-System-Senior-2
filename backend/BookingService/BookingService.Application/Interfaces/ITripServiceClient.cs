namespace BookingService.Application.Interfaces;

public interface ITripServiceClient
{
    Task<bool> DecrementSeatAsync(Guid tripId, int count, string jwtToken);
    Task<bool> IncrementSeatAsync(Guid tripId, int count, string jwtToken);
    Task<DateTime?> GetTripDepartureTimeUtcAsync(Guid tripId, string jwtToken);
    Task<TripInfo?> GetTripInfoAsync(Guid tripId, string jwtToken);

    public class TripInfo
    {
        public DateTime DepartureTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? DelayMinutes { get; set; }
        public int AvailableSeats { get; set; }
    }
}
