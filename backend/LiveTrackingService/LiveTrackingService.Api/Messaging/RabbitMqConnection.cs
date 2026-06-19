using System.Threading;
using RabbitMQ.Client;

namespace LiveTrackingService.Api.Messaging;

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
        };

        const int maxAttempts = 5;
        const int delayMilliseconds = 2000;

        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                _connection = factory.CreateConnection();
                return _connection;
            }
            catch
            {
                if (attempt == maxAttempts)
                {
                    throw;
                }

                Thread.Sleep(delayMilliseconds);
            }
        }

        throw new InvalidOperationException("Unable to create RabbitMQ connection after retries.");
    }

    public void Dispose()
    {
        if (_connection != null)
        {
            if (_connection.IsOpen)
            {
                _connection.Close();
            }
            _connection.Dispose();
        }
    }
}
