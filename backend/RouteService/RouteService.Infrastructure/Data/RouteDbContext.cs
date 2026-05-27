namespace RouteService.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;
using RouteService.Domain.Entities;

public class RouteDbContext : DbContext
{
    public RouteDbContext(DbContextOptions<RouteDbContext> options) : base(options) { }

    public DbSet<Route> Routes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Route>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique(); 
            entity.HasIndex(e => new { e.StartLocation, e.EndLocation }).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.StartLocation).IsRequired().HasMaxLength(150);
            entity.Property(e => e.EndLocation).IsRequired().HasMaxLength(150);
        });
    }
}
