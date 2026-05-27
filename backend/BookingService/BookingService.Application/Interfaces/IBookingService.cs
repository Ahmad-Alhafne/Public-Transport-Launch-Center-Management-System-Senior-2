namespace BookingService.Application.Interfaces;

using BookingService.Application.DTOs;

public interface IBookingService
{
    Task<IEnumerable<BookingDto>> GetAllBookingsAsync();
    Task<BookingDto> GetBookingByIdAsync(Guid id);
    Task<IEnumerable<BookingDto>> GetBookingsByPassengerIdAsync(Guid passengerId);
    Task<IEnumerable<BookingDto>> GetMyActiveBookingsAsync(Guid passengerId, string jwtToken);
    Task<IEnumerable<BookingDto>> GetMyBookingHistoryAsync(Guid passengerId, int daysBack, string jwtToken);
    Task<IEnumerable<BookingDto>> GetConfirmedBookingsByTripIdAsync(Guid tripId);
    Task<BookingDto> CreateBookingAsync(CreateBookingDto dto, Guid passengerId, string jwtToken);
    Task<BookingDto> CancelBookingAsync(CancelBookingDto dto, string jwtToken);
}
