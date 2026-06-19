using RabbitMQ.Client;

namespace AuditService.Api.Messaging;

public interface IRabbitMqConnection : IDisposable
{
    IConnection CreateConnection();
}
