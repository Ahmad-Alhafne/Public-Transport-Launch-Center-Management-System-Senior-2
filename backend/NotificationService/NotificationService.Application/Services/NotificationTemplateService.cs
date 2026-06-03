namespace NotificationService.Application.Services;

using NotificationService.Application.Interfaces;
using NotificationService.Domain.Entities;

public class NotificationTemplateService : INotificationTemplateService
{
    private readonly INotificationRepository _repository;

    public NotificationTemplateService(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<NotificationTemplate?> GetTemplateByKeyAsync(string key)
    {
        return await _repository.GetTemplateByKeyAsync(key);
    }

    public async Task<IEnumerable<NotificationTemplate>> GetAllTemplatesAsync()
    {
        return await _repository.GetAllTemplatesAsync();
    }
}
