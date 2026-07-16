namespace PaymentService.Application.Features.Payments.Queries;

using MediatR;
using PaymentService.Application.DTOs;

public record GetPaymentByPaymentIntentIdQuery(string PaymentIntentId) : IRequest<PaymentDto>;
