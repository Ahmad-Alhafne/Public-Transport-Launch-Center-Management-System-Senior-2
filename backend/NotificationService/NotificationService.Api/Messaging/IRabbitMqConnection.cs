using RabbitMQ.Client;

namespace NotificationService.Api.Messaging;

public interface IRabbitMqConnection : IDisposable
{
    IConnection CreateConnection();
}
