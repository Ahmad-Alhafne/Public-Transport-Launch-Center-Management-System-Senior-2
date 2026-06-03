namespace NotificationService.Application.Interfaces;

using NotificationService.Domain.Entities;

public interface INotificationRepository
{
    Task<Notification?> GetByIdAsync(Guid id);
    Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId, string? role = null);
    Task<int> GetUnreadCountAsync(Guid userId, string? role = null);
    Task<IEnumerable<Notification>> GetAllAsync();
    Task AddAsync(Notification notification);
    Task UpdateAsync(Notification notification);
    Task DeleteAsync(Guid id);

    Task<NotificationPreference?> GetPreferenceAsync(Guid userId, string role);
    Task AddOrUpdatePreferenceAsync(NotificationPreference preference);
    Task<IEnumerable<NotificationPreference>> GetPreferencesByRoleAsync(string role);

    Task<NotificationTemplate?> GetTemplateByKeyAsync(string key);
    Task<IEnumerable<NotificationTemplate>> GetAllTemplatesAsync();
    Task AddTemplateAsync(NotificationTemplate template);

    Task<IEnumerable<ScheduledReminder>> GetDueRemindersAsync(DateTime utcNow);
    Task<ScheduledReminder?> GetScheduledReminderAsync(Guid tripId, Guid userId, string role);
    Task AddScheduledReminderAsync(ScheduledReminder scheduledReminder);
    Task UpdateScheduledReminderAsync(ScheduledReminder scheduledReminder);

    Task SaveChangesAsync();
}
