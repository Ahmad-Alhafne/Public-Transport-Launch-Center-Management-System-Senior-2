namespace AuthService.Infrastructure.Data;

using AuthService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class AuthDbContext : DbContext
{
    public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Role).HasConversion<string>();

            // System fields
            entity.Property(e => e.AccountCreationDate).IsRequired();
            entity.Property(e => e.LastProfileUpdate).IsRequired();
            entity.Property(e => e.AccountStatus).HasConversion<string>().IsRequired();

            // Common profile fields
            entity.Property(e => e.PhoneNumber).HasMaxLength(50);
            entity.Property(e => e.NationalIdNumber).HasMaxLength(20);
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.Property(e => e.Gender).HasConversion<string>();
            entity.Property(e => e.DateOfBirth);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.Region).HasMaxLength(100);
            entity.Property(e => e.DisabilityStatus).HasConversion<string>();

            // Admin fields
            entity.Property(e => e.AdminLevel).HasConversion<string>();

            // Driver identity fields
            entity.Property(e => e.FatherName).HasMaxLength(100);
            entity.Property(e => e.MotherName).HasMaxLength(100);
            entity.Property(e => e.BirthPlace).HasMaxLength(150);
            entity.Property(e => e.CurrentAddress).HasMaxLength(250);
            entity.Property(e => e.CardNumber).HasMaxLength(50);
            entity.Property(e => e.CardIssueDate);
            entity.Property(e => e.FaceColor).HasMaxLength(50);
            entity.Property(e => e.EyeColor).HasMaxLength(50);

            //
            entity.Property(e => e.LanguagePreference).HasMaxLength(2).HasDefaultValue("ar");
        });
    }
}
