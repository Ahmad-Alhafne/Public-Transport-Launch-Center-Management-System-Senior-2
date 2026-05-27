namespace BookingService.Application.Interfaces;

using BookingService.Domain.Entities;

public interface IBookingRepository
{
    Task<IEnumerable<Booking>> GetAllAsync();
    Task<Booking?> GetByIdAsync(Guid id);
    Task<Booking?> GetByCancellationCodeAsync(string code);
    Task<IEnumerable<Booking>> GetByPassengerIdAsync(Guid passengerId);
    Task AddAsync(Booking booking);
    Task UpdateAsync(Booking booking);
    Task SaveChangesAsync();
}
