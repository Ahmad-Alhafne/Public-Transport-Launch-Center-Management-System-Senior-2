namespace AuthService.Infrastructure.Data;

using AuthService.Domain.Entities;
using AuthService.Domain.Enums;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AuthDbContext>();

        // Ensure the database schema is up-to-date using migrations.
        // SQL Server in containers can take some time to become ready, so retry a few times.
        const int maxAttempts = 30;
        const int delayMs = 2000;
        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                await context.Database.MigrateAsync();
                break;
            }
            catch (Exception) when (attempt < maxAttempts)
            {
                await Task.Delay(delayMs);
            }
        }

        var citizenPasswordHash = BCrypt.HashPassword("Citizen123!");

        var requiredUsers = new List<User>
        {
            new User
            {
                FullName = "System Admin",
                Email = "admin@system.com",
                PasswordHash = BCrypt.HashPassword("Admin123!"),
                Role = Role.Admin,
                PhoneNumber = "+10000000001",
                FirstName = "Admin",
                LastName = "User",
                Gender = Gender.Female,
                DateOfBirth = new DateTime(1985, 1, 1),
                City = "Capital City",
                Region = "Central",
                NationalIdNumber = "A1234567890",
                AccountCreationDate = DateTime.UtcNow,
                LastProfileUpdate = DateTime.UtcNow,
                AccountStatus = AccountStatus.Active,
                AdminLevel = AdminLevel.SuperAdmin
            },
            new User
            {
                FullName = "Bus Driver One",
                Email = "driver@system.com",
                PasswordHash = BCrypt.HashPassword("Driver123!"),
                Role = Role.Driver,
                PhoneNumber = "+10000000002",
                FirstName = "Driver",
                LastName = "One",
                Gender = Gender.Male,
                DateOfBirth = new DateTime(1990, 5, 15),
                City = "Transit City",
                Region = "North",
                NationalIdNumber = "D9876543210",
                AccountCreationDate = DateTime.UtcNow,
                LastProfileUpdate = DateTime.UtcNow,
                AccountStatus = AccountStatus.Active
            },
            new User
            {
                FullName = "Standard Citizen",
                Email = "citizen@system.com",
                PasswordHash = citizenPasswordHash,
                Role = Role.Citizen,
                PhoneNumber = "+10000000003",
                FirstName = "Standard",
                LastName = "Citizen",
                Gender = Gender.Female,
                DateOfBirth = new DateTime(1995, 7, 20),
                City = "Hometown",
                Region = "East",
                NationalIdNumber = "C1122334455",
                AccountCreationDate = DateTime.UtcNow,
                LastProfileUpdate = DateTime.UtcNow,
                AccountStatus = AccountStatus.Active
            }
            ,
            new User
            {
                FullName = "Auditor One",
                Email = "auditor1@system.com",
                PasswordHash = BCrypt.HashPassword("Auditor123!"),
                Role = Role.Auditor,
                PhoneNumber = "+10000000010",
                FirstName = "Auditor",
                LastName = "One",
                Gender = Gender.Male,
                DateOfBirth = new DateTime(1988, 3, 22),
                City = "Audit City",
                Region = "West",
                NationalIdNumber = "AU1000001",
                AccountCreationDate = DateTime.UtcNow,
                LastProfileUpdate = DateTime.UtcNow,
                AccountStatus = AccountStatus.Active
            },
            new User
            {
                FullName = "Auditor Two",
                Email = "auditor2@system.com",
                PasswordHash = BCrypt.HashPassword("Auditor123!"),
                Role = Role.Auditor,
                PhoneNumber = "+10000000011",
                FirstName = "Auditor",
                LastName = "Two",
                Gender = Gender.Female,
                DateOfBirth = new DateTime(1992, 11, 5),
                City = "Audit Town",
                Region = "South",
                NationalIdNumber = "AU1000002",
                AccountCreationDate = DateTime.UtcNow,
                LastProfileUpdate = DateTime.UtcNow,
                AccountStatus = AccountStatus.Active
            }
            ,
            new User
            {
                FullName = "Queue Organizer",
                Email = "organizer@system.com",
                PasswordHash = BCrypt.HashPassword("Organizer123!"),
                Role = Role.QueueOrganizer,
                PhoneNumber = "+10000000020",
                FirstName = "Queue",
                LastName = "Organizer",
                Gender = Gender.Female,
                DateOfBirth = new DateTime(1990, 1, 1),
                City = "Dispatch City",
                Region = "Central",
                NationalIdNumber = "QO1000001",
                AccountCreationDate = DateTime.UtcNow,
                LastProfileUpdate = DateTime.UtcNow,
                AccountStatus = AccountStatus.Active
            }
        };

        var basePhone = 10000000003;
        for (int i = 1; i <= 200; i++)
        {
            var index = i;
            requiredUsers.Add(new User
            {
                FullName = $"Citizen {index}",
                Email = $"citizen{index}@system.com",
                PasswordHash = citizenPasswordHash,
                Role = Role.Citizen,
                PhoneNumber = $"+{basePhone + index}",
                FirstName = "Citizen",
                LastName = index.ToString(),
                Gender = (index % 2 == 0) ? Gender.Female : Gender.Male,
                DateOfBirth = new DateTime(1990, 1, 1).AddDays(index),
                City = "Hometown",
                Region = "East",
                NationalIdNumber = $"C{1122334455 + index}",
                AccountCreationDate = DateTime.UtcNow,
                LastProfileUpdate = DateTime.UtcNow,
                AccountStatus = AccountStatus.Active
            });
        }

        var existingEmails = await context.Users
            .Select(u => u.Email.ToLower())
            .ToListAsync();

        var usersToAdd = requiredUsers
            .Where(user => !existingEmails.Contains(user.Email.ToLower()))
            .ToList();

        if (usersToAdd.Any())
        {
            await context.Users.AddRangeAsync(usersToAdd);
            await context.SaveChangesAsync();
        }
    }
}
