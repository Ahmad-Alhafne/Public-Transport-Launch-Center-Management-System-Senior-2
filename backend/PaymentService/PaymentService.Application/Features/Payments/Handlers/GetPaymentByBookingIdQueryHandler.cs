using MediatR;
using PaymentService.Application.DTOs;
using PaymentService.Application.Features.Payments.Queries;
using PaymentService.Domain.Interfaces;

namespace PaymentService.Application.Features.Payments.Handlers;

public class GetPaymentByBookingIdQueryHandler : IRequestHandler<GetPaymentByBookingIdQuery, PaymentDto?>
{
    private readonly IPaymentRepository _repository;

    public GetPaymentByBookingIdQueryHandler(IPaymentRepository repository)
    {
        _repository = repository;
    }

    public async Task<PaymentDto?> Handle(GetPaymentByBookingIdQuery request, CancellationToken cancellationToken)
    {
        var payment = await _repository.GetByBookingIdAsync(request.BookingId);
        if (payment == null)
        {
            return null;
        }

        return MapToDto(payment);
    }

    private static PaymentDto MapToDto(PaymentService.Domain.Entities.Payment payment)
    {
        return new PaymentDto
        {
            Id = payment.Id,
            BookingId = payment.BookingId,
            UserId = payment.UserId,
            Amount = payment.Amount,
            Currency = payment.Currency,
            PaymentIntentId = payment.PaymentIntentId,
            Status = payment.Status,
            PaymentMethod = payment.PaymentMethod,
            CreatedAt = payment.CreatedAt,
            UpdatedAt = payment.UpdatedAt
        };
    }
}
