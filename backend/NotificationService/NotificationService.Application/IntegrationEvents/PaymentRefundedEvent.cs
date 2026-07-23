namespace NotificationService.Application.IntegrationEvents;

public class PaymentRefundedEvent
{
    public Guid PaymentId { get; set; }
    public Guid BookingId { get; set; }
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "usd";
}
