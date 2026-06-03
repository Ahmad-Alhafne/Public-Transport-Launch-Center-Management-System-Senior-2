namespace NotificationService.Application.IntegrationEvents;

public class NotificationCreatedEvent : IntegrationEvent
{
    public Guid NotificationId { get; set; }
    public Guid UserId { get; set; }
    public string TargetRole { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string NotificationType { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
