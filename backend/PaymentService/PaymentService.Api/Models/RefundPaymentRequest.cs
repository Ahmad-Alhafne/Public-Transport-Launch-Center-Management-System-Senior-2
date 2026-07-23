namespace PaymentService.Api.Models;

public class RefundPaymentRequest
{
    public Guid BookingId { get; set; }
    public Guid RequestedByUserId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "usd";
}
