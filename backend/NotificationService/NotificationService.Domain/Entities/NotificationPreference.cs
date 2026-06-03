namespace NotificationService.Domain.Entities;

public class NotificationPreference
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool ReminderEnabled { get; set; } = true;
    public int ReminderMinutesBeforeDeparture { get; set; } = 30;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
