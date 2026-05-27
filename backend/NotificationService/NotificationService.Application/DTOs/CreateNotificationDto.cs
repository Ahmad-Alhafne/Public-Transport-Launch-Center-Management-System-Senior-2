namespace NotificationService.Application.DTOs;

using NotificationService.Domain.Enums;

public class CreateNotificationDto
{
    public Guid UserId { get; set; }
    public string? TargetRole { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
}
