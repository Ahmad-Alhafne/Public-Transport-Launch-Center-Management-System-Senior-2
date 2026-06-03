using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace NotificationService.Infrastructure.Data;

public class NotificationDbContextFactory : IDesignTimeDbContextFactory<NotificationDbContext>
{
    public NotificationDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("NOTIFICATION_SERVICE_CONNECTION_STRING")
            ?? "Server=(localdb)\\mssqllocaldb;Database=NotificationServiceDb;Trusted_Connection=true;";

        var optionsBuilder = new DbContextOptionsBuilder<NotificationDbContext>();
        optionsBuilder.UseSqlServer(connectionString, sqlOptions => sqlOptions.EnableRetryOnFailure());

        return new NotificationDbContext(optionsBuilder.Options);
    }
}
