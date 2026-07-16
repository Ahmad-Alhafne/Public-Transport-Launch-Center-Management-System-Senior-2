using LiveTrackingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LiveTrackingService.Infrastructure.Data;

public class LiveTrackingDbContext : DbContext
{
    public LiveTrackingDbContext(DbContextOptions<LiveTrackingDbContext> options) : base(options)
        {
    }

    public DbSet<LiveTripTracking> LiveTripTrackings { get; set; } = null!;
    public DbSet<TrackingHistory> TrackingHistories { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<LiveTripTracking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TrackingStatus).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CurrentLatitude).IsRequired();
            entity.Property(e => e.CurrentLongitude).IsRequired();
            entity.Property(e => e.LastUpdatedAt).IsRequired();
            entity.HasIndex(e => e.TripId);

            entity.HasData(new LiveTripTracking
            {
                Id = Guid.Parse("a1111111-1111-1111-1111-111111111111"),
                TripId = Guid.Parse("b2222222-2222-2222-2222-222222222222"),
                DriverId = Guid.Parse("c3333333-3333-3333-3333-333333333333"),
                VehicleId = Guid.Parse("d4444444-4444-4444-4444-444444444444"),
                CurrentLatitude = 31.9500,
                CurrentLongitude = 35.9333,
                CurrentSpeed = 58.4,
                LastUpdatedAt = DateTime.UtcNow,
                TrackingStatus = "Active"
            });
        });

        modelBuilder.Entity<TrackingHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Latitude).IsRequired();
            entity.Property(e => e.Longitude).IsRequired();
            entity.Property(e => e.Timestamp).IsRequired();
            entity.HasIndex(e => e.TripId);

            entity.HasData(
                new TrackingHistory
                {
                    Id = Guid.Parse("e5555555-5555-5555-5555-555555555555"),
                    TripId = Guid.Parse("b2222222-2222-2222-2222-222222222222"),
                    Latitude = 31.9500,
                    Longitude = 35.9333,
                    Speed = 52.1,
                    Timestamp = DateTime.UtcNow.AddMinutes(-2)
                },
                new TrackingHistory
                {
                    Id = Guid.Parse("f6666666-6666-6666-6666-666666666666"),
                    TripId = Guid.Parse("b2222222-2222-2222-2222-222222222222"),
                    Latitude = 31.9512,
                    Longitude = 35.9350,
                    Speed = 58.4,
                    Timestamp = DateTime.UtcNow.AddMinutes(-1)
                }
            );
        });
    }
}
