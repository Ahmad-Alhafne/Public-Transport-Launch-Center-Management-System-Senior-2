namespace PaymentService.Application.Interfaces;

public interface IPaymentEventPublisher
{
    Task PublishAsync<TEvent>(TEvent @event) where TEvent : class;
}
