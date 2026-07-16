namespace NotificationService.Application.IntegrationEvents;

public class PaymentSuccessfulEvent : IntegrationEvent
{
    public Guid PaymentId { get; set; }
    public Guid BookingId { get; set; }
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string PaymentIntentId { get; set; } = string.Empty;
}
