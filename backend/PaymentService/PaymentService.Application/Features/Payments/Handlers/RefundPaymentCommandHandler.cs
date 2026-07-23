using MediatR;
using PaymentService.Application.Features.Payments.Commands;
using PaymentService.Application.Interfaces;
using PaymentService.Application.IntegrationEvents;
using PaymentService.Domain.Enums;
using PaymentService.Domain.Interfaces;

namespace PaymentService.Application.Features.Payments.Handlers;

public class RefundPaymentCommandHandler : IRequestHandler<RefundPaymentCommand, bool>
{
    private readonly IPaymentRepository _repository;
    private readonly IStripePaymentGateway _stripeGateway;
    private readonly IPaymentEventPublisher _eventPublisher;

    public RefundPaymentCommandHandler(IPaymentRepository repository, IStripePaymentGateway stripeGateway, IPaymentEventPublisher eventPublisher)
    {
        _repository = repository;
        _stripeGateway = stripeGateway;
        _eventPublisher = eventPublisher;
    }

    public async Task<bool> Handle(RefundPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _repository.GetByBookingIdAsync(request.BookingId);
        if (payment == null)
            throw new Exception("Payment for booking not found.");

        if (payment.Status != PaymentStatus.Succeeded && payment.Status != PaymentStatus.PartiallyRefunded)
            throw new Exception("Payment is not in a refundable state.");

        var amountInCents = Convert.ToInt64(Math.Round(request.Amount * 100, MidpointRounding.AwayFromZero));

        // Use gateway to refund
        var refunded = await _stripeGateway.RefundAsync(payment.PaymentIntentId, amountInCents);
        if (!refunded)
            throw new Exception("Refund failed at gateway.");

        // Update payment record status
        payment.Status = request.Amount >= payment.Amount ? PaymentStatus.Refunded : PaymentStatus.PartiallyRefunded;
        payment.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(payment);
        await _repository.SaveChangesAsync();

        // Publish PaymentRefundedEvent
        await _eventPublisher.PublishAsync(new PaymentRefundedEvent
        {
            PaymentId = payment.Id,
            BookingId = payment.BookingId,
            UserId = payment.UserId,
            Amount = request.Amount,
            Currency = request.Currency ?? payment.Currency
        });

        return true;
    }
}
