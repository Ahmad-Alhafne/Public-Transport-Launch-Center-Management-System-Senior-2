namespace BookingService.Infrastructure.Repositories;

using BookingService.Application.Interfaces;
using BookingService.Domain.Entities;
using BookingService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

public class BookingRepository : IBookingRepository
{
    private readonly BookingDbContext _dbContext;

    public BookingRepository(BookingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<Booking>> GetAllAsync()
    {
        return await _dbContext.Bookings.OrderByDescending(b => b.BookedAt).ToListAsync();
    }

    public async Task<Booking?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Bookings.FindAsync(id);
    }

    public async Task<Booking?> GetByCancellationCodeAsync(string code)
    {
        return await _dbContext.Bookings.FirstOrDefaultAsync(b => b.CancellationCode == code);
    }

    public async Task<IEnumerable<Booking>> GetByPassengerIdAsync(Guid passengerId)
    {
        return await _dbContext.Bookings.Where(b => b.PassengerId == passengerId).OrderByDescending(b => b.BookedAt).ToListAsync();
    }

    public async Task AddAsync(Booking booking)
    {
        await _dbContext.Bookings.AddAsync(booking);
    }

    public Task UpdateAsync(Booking booking)
    {
        _dbContext.Bookings.Update(booking);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}
