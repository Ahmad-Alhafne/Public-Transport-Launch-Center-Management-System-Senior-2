namespace NotificationService.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Entities;
using NotificationService.Infrastructure.Data;

public class NotificationRepository : INotificationRepository
{
    private readonly NotificationDbContext _context;

    public NotificationRepository(NotificationDbContext context)
    {
        _context = context;
    }

    public async Task<Notification?> GetByIdAsync(Guid id)
    {
        return await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId, string? role = null)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId || (!string.IsNullOrEmpty(role) && n.TargetRole == role))
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(Guid userId, string? role = null)
    {
        return await _context.Notifications
            .Where(n => !n.IsRead && (n.UserId == userId || (!string.IsNullOrEmpty(role) && n.TargetRole == role)))
            .CountAsync();
    }

    public async Task<IEnumerable<Notification>> GetAllAsync()
    {
        return await _context.Notifications.ToListAsync();
    }

    public async Task AddAsync(Notification notification)
    {
        await _context.Notifications.AddAsync(notification);
    }

    public async Task UpdateAsync(Notification notification)
    {
        _context.Notifications.Update(notification);
        await Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id)
    {
        var notification = await GetByIdAsync(id);
        if (notification != null)
        {
            _context.Notifications.Remove(notification);
        }
    }

    public async Task<NotificationPreference?> GetPreferenceAsync(Guid userId, string role)
    {
        return await _context.NotificationPreferences
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Role == role);
    }

    public async Task AddOrUpdatePreferenceAsync(NotificationPreference preference)
    {
        var existing = await GetPreferenceAsync(preference.UserId, preference.Role);
        if (existing is null)
        {
            await _context.NotificationPreferences.AddAsync(preference);
        }
        else
        {
            existing.ReminderEnabled = preference.ReminderEnabled;
            existing.ReminderMinutesBeforeDeparture = preference.ReminderMinutesBeforeDeparture;
            existing.UpdatedAt = preference.UpdatedAt;
            _context.NotificationPreferences.Update(existing);
        }
    }

    public async Task<IEnumerable<NotificationPreference>> GetPreferencesByRoleAsync(string role)
    {
        return await _context.NotificationPreferences.Where(p => p.Role == role).ToListAsync();
    }

    public async Task<NotificationTemplate?> GetTemplateByKeyAsync(string key)
    {
        return await _context.NotificationTemplates.FirstOrDefaultAsync(t => t.Key == key && t.IsActive);
    }

    public async Task<IEnumerable<NotificationTemplate>> GetAllTemplatesAsync()
    {
        return await _context.NotificationTemplates.Where(t => t.IsActive).ToListAsync();
    }

    public async Task AddTemplateAsync(NotificationTemplate template)
    {
        await _context.NotificationTemplates.AddAsync(template);
    }

    public async Task<IEnumerable<ScheduledReminder>> GetDueRemindersAsync(DateTime utcNow)
    {
        return await _context.ScheduledReminders
            .Where(r => !r.Processed && r.ReminderAtUtc <= utcNow)
            .OrderBy(r => r.ReminderAtUtc)
            .ToListAsync();
    }

    public async Task<ScheduledReminder?> GetScheduledReminderAsync(Guid tripId, Guid userId, string role)
    {
        return await _context.ScheduledReminders
            .FirstOrDefaultAsync(r => r.TripId == tripId && r.UserId == userId && r.Role == role);
    }

    public async Task AddScheduledReminderAsync(ScheduledReminder scheduledReminder)
    {
        await _context.ScheduledReminders.AddAsync(scheduledReminder);
    }

    public async Task UpdateScheduledReminderAsync(ScheduledReminder scheduledReminder)
    {
        _context.ScheduledReminders.Update(scheduledReminder);
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
