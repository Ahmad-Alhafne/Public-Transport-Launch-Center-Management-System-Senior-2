namespace ComplaintService.Infrastructure.Data;

using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ComplaintDbContext>();

        // Ensure the database exists before EF attempts to connect to it.
        await EnsureDatabaseExistsAsync(context.Database.GetConnectionString());

        await context.Database.EnsureCreatedAsync();
        // No sample complaints seeded; complaints are created dynamically
    }

    private static async Task EnsureDatabaseExistsAsync(string connectionString)
    {
        var builder = new SqlConnectionStringBuilder(connectionString);
        var databaseName = builder.InitialCatalog;
        if (string.IsNullOrWhiteSpace(databaseName))
        {
            return;
        }

        // Connect to master so we can create the database if it does not yet exist.
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
