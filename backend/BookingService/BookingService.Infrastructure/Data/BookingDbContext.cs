namespace BookingService.Infrastructure.Data;

using BookingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class BookingDbContext : DbContext
{
    public BookingDbContext(DbContextOptions<BookingDbContext> options) : base(options) { }

    public DbSet<Booking> Bookings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CancellationCode).IsUnique();
            entity.Property(e => e.PassengerName).IsRequired().HasMaxLength(150);
            entity.Property(e => e.CancellationCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.SeatCount).IsRequired();
            entity.Property(e => e.TripDepartureTimeUtc).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasIndex(e => e.PassengerId);
            entity.HasIndex(e => e.TripId);
        });
    }
}
