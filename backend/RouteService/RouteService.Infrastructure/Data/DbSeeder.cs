namespace RouteService.Infrastructure.Data;

using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using RouteService.Domain.Entities;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<RouteDbContext>();

        // Ensure the database exists before EF attempts to connect to it.
        // This is needed because SQL Server will reject connections to a database that does not exist.
        await EnsureDatabaseExistsAsync(context.Database.GetConnectionString());

        // Ensure EF creates schema (tables, etc.) once the DB is available.
        await context.Database.EnsureCreatedAsync();

        // Lightweight schema patching for dev DBs created via EnsureCreated.
        // Adds unique index on (StartLocation, EndLocation) if missing.
        await context.Database.ExecuteSqlRawAsync("""
            IF NOT EXISTS (
                SELECT 1
                FROM sys.indexes
                WHERE name = 'IX_Routes_StartLocation_EndLocation'
                  AND object_id = OBJECT_ID('dbo.Routes')
            )
            BEGIN
                CREATE UNIQUE INDEX [IX_Routes_StartLocation_EndLocation]
                ON [dbo].[Routes]([StartLocation], [EndLocation]);
            END
            """);

        if (!await context.Routes.AnyAsync())
        {
            var routes = new List<Route>
            {
                new Route
                {
                    Name = "Downtown - Airport Express",
                    StartLocation = "Central Station",
                    EndLocation = "International Airport",
                    DistanceKm = 25.5,
                    EstimatedDurationMins = 45,
                    IsActive = true
                },
                new Route
                {
                    Name = "Northside Loop",
                    StartLocation = "North Terminal",
                    EndLocation = "North Terminal",
                    DistanceKm = 15.0,
                    EstimatedDurationMins = 30,
                    IsActive = true
                },
                new Route
                {
                    Name = "City Center - Suburbs",
                    StartLocation = "City Center",
                    EndLocation = "West Suburbs",
                    DistanceKm = 35.2,
                    EstimatedDurationMins = 60,
                    IsActive = true
                }
            };

            await context.Routes.AddRangeAsync(routes);
            await context.SaveChangesAsync();
        }
    }

    private static async Task EnsureDatabaseExistsAsync(string connectionString)
    {
        var builder = new SqlConnectionStringBuilder(connectionString);
        var databaseName = builder.InitialCatalog;
        if (string.IsNullOrWhiteSpace(databaseName))
        {
            return;
        }

        // Connect to master so we can create the database if it does not already exist.
        builder.InitialCatalog = "master";

        // Retry because SQL Server may not be ready immediately after container startup.
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
