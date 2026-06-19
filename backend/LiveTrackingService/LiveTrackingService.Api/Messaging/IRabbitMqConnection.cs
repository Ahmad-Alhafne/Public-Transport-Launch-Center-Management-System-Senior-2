using RabbitMQ.Client;

namespace LiveTrackingService.Api.Messaging;

public interface IRabbitMqConnection : IDisposable
{
    IConnection CreateConnection();
}
