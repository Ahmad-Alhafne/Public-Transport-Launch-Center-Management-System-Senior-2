namespace NotificationService.Application.DTOs;

public class NotificationPreferenceDto
{
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool ReminderEnabled { get; set; }
    public int ReminderMinutesBeforeDeparture { get; set; }
}
