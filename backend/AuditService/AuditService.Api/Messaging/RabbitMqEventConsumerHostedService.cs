using System.Text;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AuditService.Api.Messaging;

public class RabbitMqEventConsumerHostedService : BackgroundService
{
    private readonly IRabbitMqConnection _connection;
    private readonly RabbitMqOptions _options;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RabbitMqEventConsumerHostedService> _logger;
    private IModel? _channel;

    public RabbitMqEventConsumerHostedService(IRabbitMqConnection connection, RabbitMqOptions options, IServiceScopeFactory scopeFactory, ILogger<RabbitMqEventConsumerHostedService> logger)
    {
        _connection = connection;
        _options = options;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Try to establish a connection to RabbitMQ but do not crash the host if broker is temporarily unavailable.
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var connection = _connection.CreateConnection();
                _channel = connection.CreateModel();

                _channel.ExchangeDeclare(_options.Exchange, ExchangeType.Direct, durable: _options.Durable, autoDelete: false);
                _channel.QueueDeclare(_options.Queue, durable: _options.Durable, exclusive: false, autoDelete: false, arguments: null);
                _channel.QueueBind(_options.Queue, _options.Exchange, string.Empty);

                var consumer = new AsyncEventingBasicConsumer(_channel);
                consumer.Received += OnMessageReceivedAsync;
                _channel.BasicConsume(queue: _options.Queue, autoAck: false, consumer: consumer);

                _logger.LogInformation("Connected to RabbitMQ and consuming queue {Queue}", _options.Queue);
                break; // successfully started consumer
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "RabbitMQ not available, retrying in 5s");
                try { await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken); } catch (TaskCanceledException) { break; }
            }
        }

        // Keep running until cancellation; the consumer callbacks handle incoming messages.
        try
        {
            await Task.Delay(Timeout.Infinite, stoppingToken);
        }
        catch (TaskCanceledException) { }
    }

    private async Task OnMessageReceivedAsync(object sender, BasicDeliverEventArgs eventArgs)
    {
        var message = Encoding.UTF8.GetString(eventArgs.Body.ToArray());
        var eventType = eventArgs.BasicProperties.Type ?? string.Empty;

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<AuditIntegrationEventHandler>();
            await handler.HandleAsync(eventType, message);
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
