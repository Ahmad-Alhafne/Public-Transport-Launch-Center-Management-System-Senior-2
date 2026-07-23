namespace BookingService.Application.Interfaces;

using BookingService.Application.DTOs;

public interface IPaymentServiceClient
{
    Task<bool> RefundAsync(Guid bookingId, decimal amount, string jwtToken, string currency = "usd");
    Task<PaymentInfoDto?> GetPaymentByBookingIdAsync(Guid bookingId, string jwtToken);
}
