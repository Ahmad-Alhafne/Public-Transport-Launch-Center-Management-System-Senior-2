namespace NotificationService.Domain.Entities;

using NotificationService.Domain.Enums;

public class NotificationTemplate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Key { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public string TitleTemplate { get; set; } = string.Empty;
    public string BodyTemplate { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
