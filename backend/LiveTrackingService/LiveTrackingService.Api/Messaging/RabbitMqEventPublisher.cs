using System.Text;
using System.Text.Json;
using RabbitMQ.Client;

namespace LiveTrackingService.Api.Messaging;

public class RabbitMqEventPublisher : IRabbitMqEventPublisher
{
    private readonly IRabbitMqConnection _connection;
    private readonly RabbitMqOptions _options;

    public RabbitMqEventPublisher(IRabbitMqConnection connection, RabbitMqOptions options)
    {
        _connection = connection;
        _options = options;
    }

    public Task PublishAsync<TEvent>(TEvent @event) where TEvent : class
    {
        var rabbitConnection = _connection.CreateConnection();
        using var channel = rabbitConnection.CreateModel();

        channel.ExchangeDeclare(_options.Exchange, ExchangeType.Direct, durable: _options.Durable, autoDelete: false);

        var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(@event, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
        var properties = channel.CreateBasicProperties();
        properties.DeliveryMode = 2;
        properties.Type = @event.GetType().Name;

        channel.BasicPublish(exchange: _options.Exchange, routingKey: string.Empty, basicProperties: properties, body: body);

        return Task.CompletedTask;
    }
}
