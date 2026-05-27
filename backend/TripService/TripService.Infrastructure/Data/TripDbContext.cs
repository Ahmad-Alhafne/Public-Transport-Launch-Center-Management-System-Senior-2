namespace TripService.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;
using TripService.Domain.Entities;

public class TripDbContext : DbContext
{
    public TripDbContext(DbContextOptions<TripDbContext> options) : base(options) { }

    public DbSet<Trip> Trips { get; set; }
    public DbSet<TripService.Domain.Entities.DriverProfile> DriverProfiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Trip>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.BusNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasIndex(e => e.RouteId);
            entity.HasIndex(e => e.DriverId);
            entity.HasIndex(e => e.VehicleId);
        });

        modelBuilder.Entity<TripService.Domain.Entities.DriverProfile>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.DriverId).IsRequired();
            entity.HasIndex(e => e.DriverId).IsUnique();

            entity.Property(e => e.LicenseNumber).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LicenseExpiryDate).IsRequired();
            entity.Property(e => e.LicenseCategory).HasConversion<string>().IsRequired();
            entity.Property(e => e.IssuingAuthority).IsRequired().HasMaxLength(150);

            entity.Property(e => e.VehiclePlateNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.VehicleModel).IsRequired().HasMaxLength(100);
            entity.Property(e => e.VehicleColor).IsRequired().HasMaxLength(50);
            entity.Property(e => e.RegistrationExpiryDate).IsRequired();

            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
        });
    }
}
