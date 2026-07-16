namespace PaymentService.Application.Features.Payments.Commands;

using MediatR;
using PaymentService.Application.DTOs;

public record CreatePaymentIntentCommand(Guid BookingId, Guid UserId, decimal Amount, string Currency, string PaymentMethod) : IRequest<PaymentIntentResultDto>;
