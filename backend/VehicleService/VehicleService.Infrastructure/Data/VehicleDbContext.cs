namespace VehicleService.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;
using VehicleService.Domain.Entities;

public class VehicleDbContext : DbContext
{
    public VehicleDbContext(DbContextOptions<VehicleDbContext> options) : base(options) { }

    public DbSet<Vehicle> Vehicles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PlateNumber).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.PlateNumber).IsUnique();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
        });
    }
}
