using System.Text;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using NotificationService.Api.Handlers;
using NotificationService.Api.Messaging;

namespace NotificationService.Api.Messaging;

public class RabbitMqEventConsumerHostedService : BackgroundService
{
    private readonly IRabbitMqConnection _connection;
    private readonly RabbitMqOptions _options;
    private readonly IServiceScopeFactory _scopeFactory;
    private RabbitMQ.Client.IModel? _channel;

    public RabbitMqEventConsumerHostedService(
        IRabbitMqConnection connection,
        RabbitMqOptions options,
        IServiceScopeFactory scopeFactory)
    {
        _connection = connection;
        _options = options;
        _scopeFactory = scopeFactory;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var connection = _connection.CreateConnection();
        _channel = connection.CreateModel();

        _channel.ExchangeDeclare(_options.Exchange, ExchangeType.Direct, durable: _options.Durable, autoDelete: false);
        _channel.QueueDeclare(_options.Queue, durable: _options.Durable, exclusive: false, autoDelete: false, arguments: null);
        _channel.QueueBind(_options.Queue, _options.Exchange, string.Empty);

        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.Received += OnMessageReceivedAsync;
        _channel.BasicConsume(queue: _options.Queue, autoAck: false, consumer: consumer);

        return Task.CompletedTask;
    }

    private async Task OnMessageReceivedAsync(object sender, BasicDeliverEventArgs eventArgs)
    {
        var message = Encoding.UTF8.GetString(eventArgs.Body.ToArray());
        var eventType = eventArgs.BasicProperties.Type ?? string.Empty;

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var eventHandler = scope.ServiceProvider.GetRequiredService<NotificationIntegrationEventHandler>();
            await eventHandler.HandleAsync(eventType, message);
            _channel?.BasicAck(eventArgs.DeliveryTag, multiple: false);
        }
        catch
        {
            _channel?.BasicNack(eventArgs.DeliveryTag, multiple: false, requeue: true);
        }
    }

    public override void Dispose()
    {
        _channel?.Close();
        _channel?.Dispose();
        _connection.Dispose();
        base.Dispose();
    }
}
