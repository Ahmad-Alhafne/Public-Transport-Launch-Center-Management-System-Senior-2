namespace NotificationService.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;
using NotificationService.Domain.Entities;

public class NotificationDbContext : DbContext
{
    public NotificationDbContext(DbContextOptions<NotificationDbContext> options) : base(options)
    {
    }

    public DbSet<Notification> Notifications { get; set; }
    public DbSet<NotificationPreference> NotificationPreferences { get; set; }
    public DbSet<NotificationTemplate> NotificationTemplates { get; set; }
    public DbSet<ScheduledReminder> ScheduledReminders { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired();
            entity.Property(e => e.Message).IsRequired();
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.IsRead).IsRequired();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.TargetRole);
        });

        modelBuilder.Entity<NotificationPreference>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.Role).IsRequired();
            entity.Property(e => e.ReminderEnabled).IsRequired();
            entity.Property(e => e.ReminderMinutesBeforeDeparture).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
            entity.HasIndex(e => new { e.UserId, e.Role }).IsUnique();
        });

        modelBuilder.Entity<NotificationTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Key).IsRequired();
            entity.Property(e => e.TitleTemplate).IsRequired();
            entity.Property(e => e.BodyTemplate).IsRequired();
            entity.Property(e => e.Type).IsRequired();
            entity.Property(e => e.IsActive).IsRequired();
            entity.HasIndex(e => e.Key).IsUnique();
        });

        modelBuilder.Entity<ScheduledReminder>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TripId).IsRequired();
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.Role).IsRequired();
            entity.Property(e => e.TripNumber).IsRequired();
            entity.Property(e => e.StartLocation).IsRequired();
            entity.Property(e => e.Destination).IsRequired();
            entity.Property(e => e.DepartureTimeUtc).IsRequired();
            entity.Property(e => e.ReminderAtUtc).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.HasIndex(e => new { e.TripId, e.UserId, e.Role }).IsUnique();
            entity.HasIndex(e => e.ReminderAtUtc);
            entity.HasIndex(e => e.Processed);
        });
    }
}
