namespace PaymentService.Application.Features.Payments.Handlers;

using MediatR;
using PaymentService.Application.DTOs;
using PaymentService.Application.Features.Payments.Queries;
using PaymentService.Domain.Interfaces;

public class GetPaymentByPaymentIntentIdQueryHandler : IRequestHandler<GetPaymentByPaymentIntentIdQuery, PaymentDto>
{
    private readonly IPaymentRepository _repository;

    public GetPaymentByPaymentIntentIdQueryHandler(IPaymentRepository repository)
    {
        _repository = repository;
    }

    public async Task<PaymentDto> Handle(GetPaymentByPaymentIntentIdQuery request, CancellationToken cancellationToken)
    {
        var payment = await _repository.GetByPaymentIntentIdAsync(request.PaymentIntentId);
        if (payment == null)
        {
            throw new KeyNotFoundException($"Payment with PaymentIntentId '{request.PaymentIntentId}' was not found.");
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
