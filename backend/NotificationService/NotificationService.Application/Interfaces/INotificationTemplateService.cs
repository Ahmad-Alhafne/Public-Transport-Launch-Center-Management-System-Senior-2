namespace NotificationService.Application.Interfaces;

using NotificationService.Domain.Entities;

public interface INotificationTemplateService
{
    Task<NotificationTemplate?> GetTemplateByKeyAsync(string key);
    Task<IEnumerable<NotificationTemplate>> GetAllTemplatesAsync();
}
