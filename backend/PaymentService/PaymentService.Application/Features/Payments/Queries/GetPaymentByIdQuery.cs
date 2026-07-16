namespace PaymentService.Application.Features.Payments.Queries;

using MediatR;
using PaymentService.Application.DTOs;

public record GetPaymentByIdQuery(Guid Id) : IRequest<PaymentDto>;
