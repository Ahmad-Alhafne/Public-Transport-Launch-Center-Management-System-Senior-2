namespace TripService.Application.Interfaces;

public interface IBookingServiceClient
{
    // Uses the caller's JWT to check active bookings for that user and trip.
    // If bookingId is provided, validates that exact booking belongs to the caller and matches the trip.
    Task<bool> UserHasActiveBookingForTripAsync(Guid tripId, Guid? bookingId = null, string? jwtToken = null);
}
