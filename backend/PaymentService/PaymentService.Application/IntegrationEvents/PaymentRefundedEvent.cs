namespace PaymentService.Application.IntegrationEvents;

using PaymentService.Application.IntegrationEvents;

public class PaymentRefundedEvent : IntegrationEvent
{
    public Guid PaymentId { get; set; }
    public Guid BookingId { get; set; }
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "usd";
}
