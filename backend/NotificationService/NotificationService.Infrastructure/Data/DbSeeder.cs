namespace NotificationService.Infrastructure.Data;

using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();

        // Ensure the database exists before EF attempts to connect to it.
        await EnsureDatabaseExistsAsync(context.Database.GetConnectionString());

        // Ensure EF creates the schema (tables) once the DB is available.
        await context.Database.EnsureCreatedAsync();
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
