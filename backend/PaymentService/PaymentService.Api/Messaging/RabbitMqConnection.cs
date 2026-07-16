using RabbitMQ.Client;

namespace PaymentService.Api.Messaging;

public class RabbitMqConnection : IRabbitMqConnection
{
    private readonly RabbitMqOptions _options;
    private IConnection? _connection;

    public RabbitMqConnection(RabbitMqOptions options)
    {
        _options = options;
    }

    public IConnection CreateConnection()
    {
        if (_connection != null && _connection.IsOpen)
        {
            return _connection;
        }

        var factory = new ConnectionFactory
        {
            HostName = _options.HostName,
            UserName = _options.UserName,
            Password = _options.Password,
            VirtualHost = _options.VirtualHost,
            DispatchConsumersAsync = true
        };

        _connection = factory.CreateConnection();
        return _connection;
    }

    public void Dispose()
    {
        if (_connection != null)
        {
            try
            {
                _connection.Close();
            }
            catch
            {
            }

            _connection.Dispose();
        }
    }
}
