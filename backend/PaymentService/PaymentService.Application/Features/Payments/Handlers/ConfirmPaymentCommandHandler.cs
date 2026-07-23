namespace PaymentService.Application.Features.Payments.Handlers;

using MediatR;
using PaymentService.Application.DTOs;
using PaymentService.Application.Features.Payments.Commands;
using PaymentService.Application.IntegrationEvents;
using PaymentService.Application.Interfaces;
using PaymentService.Domain.Entities;
using PaymentService.Domain.Enums;
using PaymentService.Domain.Interfaces;
using System;
using System.Text.Json;

public class ConfirmPaymentCommandHandler : IRequestHandler<ConfirmPaymentCommand, PaymentDto>
{
    private readonly IPaymentRepository _repository;
    private readonly IStripePaymentGateway _stripePaymentGateway;
    private readonly IPaymentEventPublisher _eventPublisher;
    public ConfirmPaymentCommandHandler(
        IPaymentRepository repository,
        IStripePaymentGateway stripePaymentGateway,
        IPaymentEventPublisher eventPublisher)
    {
        _repository = repository;
        _stripePaymentGateway = stripePaymentGateway;
        _eventPublisher = eventPublisher;
    }

    public async Task<PaymentDto> Handle(ConfirmPaymentCommand request, CancellationToken cancellationToken)
    {
        ValidateRequest(request);

        var payment = await _repository.GetByPaymentIntentIdAsync(request.PaymentIntentId);
        if (payment == null)
        {
            throw new InvalidOperationException($"Payment with PaymentIntentId '{request.PaymentIntentId}' not found.");
        }

        var intent = await _stripePaymentGateway.ConfirmPaymentIntentAsync(
            request.PaymentIntentId,
            request.CardNumber ?? string.Empty,
            request.ExpMonth ?? 0,
            request.ExpYear ?? 0,
            request.Cvc ?? string.Empty,
            request.PaymentMethodToken ?? string.Empty);

        payment.Status = MapStatus(intent.Status);
        payment.PaymentMethod = "card";
        payment.UpdatedAt = DateTime.UtcNow;

        if (intent.Amount > 0)
        {
            payment.Amount = intent.Amount;
        }

        if (!string.IsNullOrWhiteSpace(intent.Currency))
        {
            payment.Currency = intent.Currency.ToLowerInvariant();
        }

        await _repository.UpdateAsync(payment);
        await _repository.SaveChangesAsync();

        if (payment.Status == PaymentStatus.Succeeded)
        {
            var evt = new PaymentSuccessfulEvent
            {
                PaymentId = payment.Id,
                BookingId = payment.BookingId,
                UserId = payment.UserId,
                Amount = payment.Amount,
                Currency = payment.Currency,
                PaymentIntentId = payment.PaymentIntentId
            };

            Console.WriteLine($"Publishing PaymentSuccessfulEvent: {JsonSerializer.Serialize(evt)}");
            await _eventPublisher.PublishAsync(evt);
        }

        return MapToDto(payment);
    }

    private static void ValidateRequest(ConfirmPaymentCommand request)
    {
        if (string.IsNullOrWhiteSpace(request.PaymentIntentId))
            throw new ArgumentException("PaymentIntentId is required.");

        // Accept either a PaymentMethodToken (recommended) OR full card details (test-only)
        if (!string.IsNullOrWhiteSpace(request.PaymentMethodToken))
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(request.CardNumber))
            throw new ArgumentException("CardNumber is required when no PaymentMethodToken is provided.");

        if (!request.ExpMonth.HasValue || request.ExpMonth <= 0 || request.ExpMonth > 12)
            throw new ArgumentException("ExpMonth must be between 1 and 12.");

        if (!request.ExpYear.HasValue || request.ExpYear < DateTime.UtcNow.Year)
            throw new ArgumentException("ExpYear must be the current year or later.");

        if (string.IsNullOrWhiteSpace(request.Cvc))
            throw new ArgumentException("Cvc is required when no PaymentMethodToken is provided.");
    }

    private static PaymentStatus MapStatus(string stripeStatus)
    {
        return stripeStatus switch
        {
            "succeeded" => PaymentStatus.Succeeded,
            "requires_action" => PaymentStatus.RequiresAction,
            "requires_payment_method" => PaymentStatus.Failed,
            "requires_capture" => PaymentStatus.Pending,
            _ => PaymentStatus.Pending
        };
    }

    private static PaymentDto MapToDto(Payment payment)
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
