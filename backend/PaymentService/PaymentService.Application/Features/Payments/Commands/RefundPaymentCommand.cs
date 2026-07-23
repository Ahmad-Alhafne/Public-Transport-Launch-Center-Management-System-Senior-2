using MediatR;

namespace PaymentService.Application.Features.Payments.Commands;

public record RefundPaymentCommand(Guid BookingId, Guid RequestedByUserId, decimal Amount, string? Currency = "usd") : IRequest<bool>;
