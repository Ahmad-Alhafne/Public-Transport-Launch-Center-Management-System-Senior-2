namespace PaymentService.Application.Features.Payments.Queries;

using MediatR;
using PaymentService.Application.DTOs;

public record GetPaymentByBookingIdQuery(Guid BookingId) : IRequest<PaymentDto?>;
