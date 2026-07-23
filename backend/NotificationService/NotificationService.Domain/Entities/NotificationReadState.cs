namespace NotificationService.Domain.Entities;

public class NotificationReadState
{
    public Guid NotificationId { get; set; }
    public Guid UserId { get; set; }
    public DateTime ReadAt { get; set; } = DateTime.UtcNow;
    public Notification Notification { get; set; } = null!;
}
