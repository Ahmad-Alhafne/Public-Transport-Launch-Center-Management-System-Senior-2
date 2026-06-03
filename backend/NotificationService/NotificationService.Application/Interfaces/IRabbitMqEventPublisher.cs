namespace NotificationService.Application.Interfaces;

public interface IRabbitMqEventPublisher
{
    Task PublishAsync<TEvent>(TEvent @event) where TEvent : class;
}
