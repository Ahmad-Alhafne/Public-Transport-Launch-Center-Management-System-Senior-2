using Microsoft.EntityFrameworkCore;
using NotificationService.Api.Channels;
using NotificationService.Domain.Entities;
using NotificationService.Domain.Enums;
using NotificationService.Infrastructure.Data;
using NotificationService.Infrastructure.Repositories;

var tests = new (string Name, Func<Task> Run)[]
{
    ("personal notifications are isolated in both directions", PersonalNotificationsAreIsolatedAsync),
    ("admins cannot access private citizen notifications", AdminCannotAccessCitizenNotificationAsync),
    ("role notifications are visible only to the target role", RoleNotificationsAreRoleScopedAsync),
    ("role read state is isolated per user", RoleReadStateIsPerUserAsync),
    ("foreign IDs cannot be read, updated, or deleted", ForeignIdsCannotBeAccessedAsync),
    ("personal real-time delivery uses only the user room", PersonalRealtimeUsesUserRoomAsync)
};

foreach (var test in tests)
{
    await test.Run();
    Console.WriteLine($"PASS: {test.Name}");
}

static async Task PersonalNotificationsAreIsolatedAsync()
{
    await using var fixture = await Fixture.CreateAsync();
    var citizen1 = Guid.NewGuid();
    var citizen2 = Guid.NewGuid();
    var first = fixture.Notification(citizen1, "Citizen 1 payment");
    var second = fixture.Notification(citizen2, "Citizen 2 payment");
    await fixture.AddAsync(first, second);

    var firstList = (await fixture.Repository.GetByUserIdAsync(citizen1, "Citizen")).ToList();
    var secondList = (await fixture.Repository.GetByUserIdAsync(citizen2, "Citizen")).ToList();

    Assert(firstList.Count == 1 && firstList[0].Id == first.Id, "Citizen 1 saw another recipient's notification.");
    Assert(secondList.Count == 1 && secondList[0].Id == second.Id, "Citizen 2 saw another recipient's notification.");
}

static async Task AdminCannotAccessCitizenNotificationAsync()
{
    await using var fixture = await Fixture.CreateAsync();
    var notification = fixture.Notification(Guid.NewGuid(), "Private citizen notification");
    await fixture.AddAsync(notification);

    var result = await fixture.Repository.GetByIdForUserAsync(notification.Id, Guid.NewGuid(), "Admin");
    Assert(result == null, "An admin could access a private citizen notification.");
}

static async Task RoleNotificationsAreRoleScopedAsync()
{
    await using var fixture = await Fixture.CreateAsync();
    var roleNotification = fixture.Notification(Guid.Empty, "Citizen announcement", "Citizen");
    await fixture.AddAsync(roleNotification);

    var citizen1 = await fixture.Repository.GetByUserIdAsync(Guid.NewGuid(), "Citizen");
    var citizen2 = await fixture.Repository.GetByUserIdAsync(Guid.NewGuid(), "Citizen");
    var driver = await fixture.Repository.GetByUserIdAsync(Guid.NewGuid(), "Driver");

    Assert(citizen1.Single().Id == roleNotification.Id, "Citizen 1 did not receive the role notification.");
    Assert(citizen2.Single().Id == roleNotification.Id, "Citizen 2 did not receive the role notification.");
    Assert(!driver.Any(), "A different role received the citizen notification.");
}

static async Task RoleReadStateIsPerUserAsync()
{
    await using var fixture = await Fixture.CreateAsync();
    var citizen1 = Guid.NewGuid();
    var citizen2 = Guid.NewGuid();
    var roleNotification = fixture.Notification(Guid.Empty, "Citizen announcement", "Citizen");
    await fixture.AddAsync(roleNotification);

    var visible = await fixture.Repository.GetByIdForUserAsync(roleNotification.Id, citizen1, "Citizen");
    await fixture.Repository.MarkAsReadAsync(visible!, citizen1);
    await fixture.Repository.SaveChangesAsync();

    var first = await fixture.Repository.GetByIdForUserAsync(roleNotification.Id, citizen1, "Citizen");
    var second = await fixture.Repository.GetByIdForUserAsync(roleNotification.Id, citizen2, "Citizen");
    Assert(first!.IsRead, "The authenticated recipient's read state was not saved.");
    Assert(!second!.IsRead, "One citizen changed another citizen's read state.");
}

static async Task ForeignIdsCannotBeAccessedAsync()
{
    await using var fixture = await Fixture.CreateAsync();
    var owner = Guid.NewGuid();
    var attacker = Guid.NewGuid();
    var notification = fixture.Notification(owner, "Owner only");
    await fixture.AddAsync(notification);

    var foreign = await fixture.Repository.GetByIdForUserAsync(notification.Id, attacker, "Citizen");
    Assert(foreign == null, "A foreign notification ID was accessible.");
    Assert(await fixture.Context.Notifications.AnyAsync(n => n.Id == notification.Id && !n.IsRead), "Foreign access mutated the notification.");
}

static Task PersonalRealtimeUsesUserRoomAsync()
{
    var userId = Guid.NewGuid();
    var personal = new Notification { UserId = userId, TargetRole = "Citizen" };
    var role = new Notification { UserId = Guid.Empty, TargetRole = "Citizen" };

    Assert(InAppNotificationChannel.GetTargetGroup(personal) == $"user:{userId}", "Personal delivery used a shared role room.");
    Assert(InAppNotificationChannel.GetTargetGroup(role) == "role:citizen", "Intentional role delivery did not use the role room.");
    return Task.CompletedTask;
}

static void Assert(bool condition, string message)
{
    if (!condition) throw new InvalidOperationException(message);
}

sealed class Fixture : IAsyncDisposable
{
    private Fixture(NotificationDbContext context)
    {
        Context = context;
        Repository = new NotificationRepository(context);
    }

    public NotificationDbContext Context { get; }
    public NotificationRepository Repository { get; }

    public static async Task<Fixture> CreateAsync()
    {
        var options = new DbContextOptionsBuilder<NotificationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var fixture = new Fixture(new NotificationDbContext(options));
        await fixture.Context.Database.EnsureCreatedAsync();
        return fixture;
    }

    public Notification Notification(Guid userId, string title, string? targetRole = null) => new()
    {
        UserId = userId,
        TargetRole = targetRole,
        Title = title,
        Message = title,
        Type = NotificationType.PaymentUpdate
    };

    public async Task AddAsync(params Notification[] notifications)
    {
        await Context.Notifications.AddRangeAsync(notifications);
        await Context.SaveChangesAsync();
    }

    public ValueTask DisposeAsync() => Context.DisposeAsync();
}
