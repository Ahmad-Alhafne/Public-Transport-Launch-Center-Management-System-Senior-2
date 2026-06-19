using Microsoft.EntityFrameworkCore;
using OrganizerService.Domain.Entities;

namespace OrganizerService.Infrastructure.Data
{
    public class OrganizerDbContext : DbContext
    {
        public OrganizerDbContext(DbContextOptions<OrganizerDbContext> options) : base(options) { }

        public DbSet<Organizer> Organizers { get; set; } = null!;
        public DbSet<OrganizerActionLog> OrganizerActionLogs { get; set; } = null!;
        public DbSet<QueuePackage> QueuePackages { get; set; } = null!;
        public DbSet<QueuePackageTrip> QueuePackageTrips { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Organizer>(b =>
            {
                b.HasKey(x => x.Id);
                b.Property(x => x.Email).IsRequired();
                b.Property(x => x.FullName).IsRequired();
            });

            modelBuilder.Entity<OrganizerActionLog>(b =>
            {
                b.HasKey(x => x.Id);
                b.Property(x => x.Action).IsRequired();
                b.Property(x => x.Timestamp).IsRequired();
            });

            modelBuilder.Entity<QueuePackage>(b =>
            {
                b.HasKey(x => x.Id);
                b.Property(x => x.RouteId).IsRequired();
                b.Property(x => x.DepartureDate).IsRequired();
                b.Property(x => x.QueueOrder).IsRequired();
            });

            modelBuilder.Entity<QueuePackageTrip>(b =>
            {
                b.HasKey(x => x.Id);
                b.Property(x => x.QueuePackageId).IsRequired();
                b.Property(x => x.TripId).IsRequired();
                b.HasIndex(x => new { x.QueuePackageId, x.QueuePosition }).IsUnique();
            });
        }
    }
}
