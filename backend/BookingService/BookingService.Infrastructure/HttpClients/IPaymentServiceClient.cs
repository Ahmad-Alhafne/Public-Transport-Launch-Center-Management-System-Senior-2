namespace BookingService.Infrastructure.HttpClients;

using BookingService.Infrastructure.HttpClients.DTOs;

public interface IPaymentServiceClient
{
    Task<bool> RefundAsync(Guid bookingId, decimal amount, string jwtToken, string currency = "usd");
    Task<PaymentInfoDto?> GetPaymentByBookingIdAsync(Guid bookingId, string jwtToken);
}
