namespace PaymentService.Application.Interfaces;

using PaymentService.Application.DTOs;

public interface IStripePaymentGateway
{
    Task<PaymentIntentResult> CreatePaymentIntentAsync(decimal amount, string currency);
    Task<PaymentIntentResult> ConfirmPaymentIntentAsync(string paymentIntentId, string cardNumber, long expMonth, long expYear, string cvc, string? paymentMethodToken);
    Task<PaymentIntentResult> GetPaymentIntentAsync(string paymentIntentId);
    Task<bool> RefundAsync(string paymentIntentId, long amountInCents);
}
