namespace PaymentService.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;
using PaymentService.Domain.Entities;

public class PaymentDbContext : DbContext
{
    public PaymentDbContext(DbContextOptions<PaymentDbContext> options)
        : base(options)
    {
    }

    public DbSet<Payment> Payments { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasIndex(e => e.PaymentIntentId).IsUnique();
            entity.Property(e => e.Currency).HasMaxLength(8).IsRequired();
            entity.Property(e => e.PaymentMethod).HasMaxLength(64);
            entity.Property(e => e.PaymentIntentId).HasMaxLength(128).IsRequired();
            entity.Property(e => e.Amount).HasPrecision(18, 2).IsRequired();
        });
    }
}
