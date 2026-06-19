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
}
