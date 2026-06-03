namespace NotificationService.Infrastructure.Data;

using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NotificationService.Domain.Entities;
using NotificationService.Domain.Enums;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();

        // Ensure the database exists before EF attempts to connect to it.
        await EnsureDatabaseExistsAsync(context.Database.GetConnectionString());

        // Ensure EF applies migrations before seeding.
        await context.Database.MigrateAsync();
        await EnsureDefaultTemplatesAsync(context);
    }

    private static async Task EnsureDefaultTemplatesAsync(NotificationDbContext context)
    {
        if (await context.NotificationTemplates.AnyAsync())
        {
            return;
        }

        var templates = new[]
        {
            new NotificationTemplate
            {
                Key = "DriverAssignment",
                Type = NotificationService.Domain.Enums.NotificationType.TripUpdate,
                TitleTemplate = "Driver assigned to Trip #{TripNumber}",
                BodyTemplate = "You have been assigned to Trip #{TripNumber} departing at {DepartureTime}. Vehicle: {VehicleInfo}. Route: {RouteInfo}.",
            },
            new NotificationTemplate
            {
                Key = "CitizenDepartureReminder",
                Type = NotificationService.Domain.Enums.NotificationType.TripUpdate,
                TitleTemplate = "Trip #{TripNumber} departs soon",
                BodyTemplate = "Your trip from {StartLocation} to {Destination} departs at {DepartureTime}.",
            },
            new NotificationTemplate
            {
                Key = "DriverDepartureReminder",
                Type = NotificationService.Domain.Enums.NotificationType.TripUpdate,
                TitleTemplate = "Reminder: Trip #{TripNumber} departs soon",
                BodyTemplate = "Trip #{TripNumber} departs at {DepartureTime}. Vehicle: {VehicleInfo}. Route: {RouteInfo}",
            },
            new NotificationTemplate
            {
                Key = "ComplaintResponse",
                Type = NotificationService.Domain.Enums.NotificationType.ComplaintUpdate,
                TitleTemplate = "Complaint response received",
                BodyTemplate = "Your complaint '{ComplaintTitle}' has a response: {ResponseSummary}.",
            },
            new NotificationTemplate
            {
                Key = "FavoriteRouteMatched",
                Type = NotificationService.Domain.Enums.NotificationType.BookingUpdate,
                TitleTemplate = "New route available: {StartLocation} → {Destination}",
                BodyTemplate = "A new trip matching your favorite route {StartLocation} → {Destination} at {DepartureTime} is now available.",
            }
        };

        await context.NotificationTemplates.AddRangeAsync(templates);
        await context.SaveChangesAsync();
    }

    private static async Task EnsureDatabaseExistsAsync(string connectionString)
    {
        var builder = new SqlConnectionStringBuilder(connectionString);
        var databaseName = builder.InitialCatalog;
        if (string.IsNullOrWhiteSpace(databaseName))
        {
            return;
        }

        // Connect to master so we can create the database if it does not exist.
        builder.InitialCatalog = "master";

        const int maxAttempts = 10;
        const int delayMs = 2000;

        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                await using var conn = new SqlConnection(builder.ConnectionString);
                await conn.OpenAsync();

                await using var cmd = conn.CreateCommand();
                cmd.CommandText = $"IF DB_ID(N'{databaseName}') IS NULL CREATE DATABASE [{databaseName}];";
                cmd.CommandType = CommandType.Text;
                await cmd.ExecuteNonQueryAsync();
                return;
            }
            catch (Exception) when (attempt < maxAttempts)
            {
                await Task.Delay(delayMs);
            }
        }
    }
}
