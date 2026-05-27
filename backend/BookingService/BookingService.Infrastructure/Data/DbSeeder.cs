namespace BookingService.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BookingDbContext>();
        await context.Database.EnsureCreatedAsync();

        // Lightweight schema patching for dev DBs created via EnsureCreated.
        // Adds SeatCount with default 1 if missing.
        await context.Database.ExecuteSqlRawAsync("""
            IF COL_LENGTH('dbo.Bookings', 'SeatCount') IS NULL
            BEGIN
                ALTER TABLE [dbo].[Bookings]
                ADD [SeatCount] int NOT NULL CONSTRAINT [DF_Bookings_SeatCount] DEFAULT(1);
            END
            """);

        // Add TripDepartureTimeUtc column if missing (for Phase 3 booking history feature)
        await context.Database.ExecuteSqlRawAsync("""
            IF COL_LENGTH('dbo.Bookings', 'TripDepartureTimeUtc') IS NULL
            BEGIN
                ALTER TABLE [dbo].[Bookings]
                ADD [TripDepartureTimeUtc] datetime2 NOT NULL CONSTRAINT [DF_Bookings_TripDepartureTimeUtc] DEFAULT(GETUTCDATE());
            END
            """);

        // No sample bookings seeded; bookings are created dynamically by citizens
    }
}
