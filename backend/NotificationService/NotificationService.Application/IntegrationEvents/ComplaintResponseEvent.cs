namespace NotificationService.Application.IntegrationEvents;

public class ComplaintResponseEvent : IntegrationEvent
{
    public Guid ComplaintId { get; set; }
    public string ComplaintTitle { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public string OwnerRole { get; set; } = string.Empty;
    public string ResponseSummary { get; set; } = string.Empty;
    public DateTime ResponseDateUtc { get; set; }
}
