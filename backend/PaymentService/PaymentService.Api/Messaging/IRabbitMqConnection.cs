using RabbitMQ.Client;

namespace PaymentService.Api.Messaging;

public interface IRabbitMqConnection : IDisposable
{
    IConnection CreateConnection();
}
