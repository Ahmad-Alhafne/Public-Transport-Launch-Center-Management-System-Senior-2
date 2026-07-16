namespace PaymentService.Application.Features.Payments.Commands;

using MediatR;
using PaymentService.Application.DTOs;

public record ConfirmPaymentCommand(string PaymentIntentId, string? CardNumber, long? ExpMonth, long? ExpYear, string? Cvc, string? PaymentMethodToken) : IRequest<PaymentDto>;
