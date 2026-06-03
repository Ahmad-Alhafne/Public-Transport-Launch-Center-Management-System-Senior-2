namespace NotificationService.Application.DTOs;

public class UpdateNotificationPreferenceDto
{
    public bool ReminderEnabled { get; set; }
    public int ReminderMinutesBeforeDeparture { get; set; }
}
