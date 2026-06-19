using AuditService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuditService.Infrastructure.Data
{
    public class AuditDbContext : DbContext
    {
        public AuditDbContext(DbContextOptions<AuditDbContext> options) : base(options)
        {
        }

        public DbSet<AuditRecord> AuditRecords { get; set; } = null!;
        public DbSet<TripAudit> TripAudits { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AuditRecord>(b =>
            {
                b.HasKey(x => x.Id);
                b.Property(x => x.ScanTime).IsRequired();
            });

            modelBuilder.Entity<TripAudit>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.TripId).IsUnique(false);
                b.Property(x => x.AssignedAt).IsRequired();
            });
        }
    }
}
