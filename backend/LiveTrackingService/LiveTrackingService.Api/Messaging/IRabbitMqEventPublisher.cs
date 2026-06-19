using System.Threading.Tasks;

namespace LiveTrackingService.Api.Messaging;

public interface IRabbitMqEventPublisher
{
    Task PublishAsync<TEvent>(TEvent @event) where TEvent : class;
}
