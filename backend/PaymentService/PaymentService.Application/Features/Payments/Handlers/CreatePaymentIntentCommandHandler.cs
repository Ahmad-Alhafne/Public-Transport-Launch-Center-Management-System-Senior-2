namespace PaymentService.Application.Features.Payments.Handlers;

using MediatR;
using PaymentService.Application.DTOs;
using PaymentService.Application.Features.Payments.Commands;
using PaymentService.Application.Interfaces;
using PaymentService.Domain.Entities;
using PaymentService.Domain.Enums;
using PaymentService.Domain.Interfaces;

public class CreatePaymentIntentCommandHandler : IRequestHandler<CreatePaymentIntentCommand, PaymentIntentResultDto>
{
    private readonly IPaymentRepository _repository;
    private readonly IStripePaymentGateway _stripePaymentGateway;

    public CreatePaymentIntentCommandHandler(IPaymentRepository repository, IStripePaymentGateway stripePaymentGateway)
    {
        _repository = repository;
        _stripePaymentGateway = stripePaymentGateway;
    }

    public async Task<PaymentIntentResultDto> Handle(CreatePaymentIntentCommand request, CancellationToken cancellationToken)
    {
        ValidateRequest(request);

        var intent = await _stripePaymentGateway.CreatePaymentIntentAsync(request.Amount, request.Currency);

        var payment = new Payment
        {
            BookingId = request.BookingId,
            UserId = request.UserId,
            Amount = request.Amount,
            Currency = request.Currency.ToLowerInvariant(),
            PaymentIntentId = intent.Id,
            PaymentMethod = request.PaymentMethod,
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(payment);
        await _repository.SaveChangesAsync();

        return MapToDto(payment, intent.ClientSecret ?? string.Empty);
    }

    private static void ValidateRequest(CreatePaymentIntentCommand request)
    {
        if (request.Amount <= 0)
            throw new ArgumentException("Amount must be greater than zero.");

        if (string.IsNullOrWhiteSpace(request.Currency))
            throw new ArgumentException("Currency is required.");

        if (request.BookingId == Guid.Empty)
            throw new ArgumentException("BookingId is required.");

        if (request.UserId == Guid.Empty)
            throw new ArgumentException("UserId is required.");
    }

    private static PaymentIntentResultDto MapToDto(Payment payment, string clientSecret)
    {
        return new PaymentIntentResultDto
        {
            Id = payment.Id,
            BookingId = payment.BookingId,
            UserId = payment.UserId,
            Amount = payment.Amount,
            Currency = payment.Currency,
            PaymentIntentId = payment.PaymentIntentId,
            ClientSecret = clientSecret,
            PaymentMethod = payment.PaymentMethod,
            Status = payment.Status.ToString(),
            CreatedAt = payment.CreatedAt,
            UpdatedAt = payment.UpdatedAt
        };
    }
}
