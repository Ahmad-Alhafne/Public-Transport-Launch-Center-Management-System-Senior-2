namespace AuditService.Api.Messaging;

public class RabbitMqOptions
{
    public string HostName { get; set; } = "localhost";
    public string UserName { get; set; } = "guest";
    public string Password { get; set; } = "guest";
    public string VirtualHost { get; set; } = "/";
    public string Exchange { get; set; } = "departure_center_events";
    public string Queue { get; set; } = "audit_service_queue";
    public bool Durable { get; set; } = true;
}
