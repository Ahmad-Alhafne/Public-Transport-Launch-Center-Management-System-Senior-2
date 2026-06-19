using System.Text.Json;
using AuditService.Application.Services;
using AuditService.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace AuditService.Api.Messaging;

public class AuditIntegrationEventHandler
{
    private readonly AuditService.Application.Services.AuditService _auditService;
    private readonly ILogger<AuditIntegrationEventHandler> _logger;

    public AuditIntegrationEventHandler(AuditService.Application.Services.AuditService auditService, ILogger<AuditIntegrationEventHandler> logger)
    {
        _auditService = auditService;
        _logger = logger;
    }

    public async Task HandleAsync(string eventType, string payload)
    {
        if (string.IsNullOrWhiteSpace(eventType) || string.IsNullOrWhiteSpace(payload)) return;

        try
        {
            switch (eventType)
            {
                case "TrackingStartedEvent":
                    {
                        var ev = JsonSerializer.Deserialize<TrackingStartedPayload>(payload);
                        if (ev != null)
                        {
                            var rec = new AuditRecord
                            {
                                Id = Guid.NewGuid(),
                                TripId = ev.TripId,
                                AuditorId = Guid.Empty,
                                ScanTime = DateTime.UtcNow,
                                Notes = $"Tracking started by driver {ev.DriverId} for vehicle {ev.VehicleId}"
                            };
                            await _auditService.AddRecordAsync(rec);
                        }
                    }
                    break;
                case "TrackingStoppedEvent":
                    {
                        var ev = JsonSerializer.Deserialize<TrackingStoppedPayload>(payload);
                        if (ev != null)
                        {
                            var rec = new AuditRecord
                            {
                                Id = Guid.NewGuid(),
                                TripId = ev.TripId,
                                AuditorId = Guid.Empty,
                                ScanTime = DateTime.UtcNow,
                                Notes = $"Tracking stopped by driver {ev.DriverId}: {ev.Reason}"
                            };
                            await _auditService.AddRecordAsync(rec);
                        }
                    }
                    break;
                case "LocationUpdatedEvent":
                    {
                        var ev = JsonSerializer.Deserialize<LocationUpdatedPayload>(payload);
                        if (ev != null)
                        {
                            var rec = new AuditRecord
                            {
                                Id = Guid.NewGuid(),
                                TripId = ev.TripId,
                                AuditorId = Guid.Empty,
                                ScanTime = ev.TimestampUtc,
                                Notes = $"Location update: {ev.Latitude},{ev.Longitude} speed={ev.Speed} by driver {ev.DriverId}"
                            };
                            await _auditService.AddRecordAsync(rec);
                        }
                    }
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to handle integration event {EventType}", eventType);
            throw;
        }
    }

    private class TrackingStartedPayload { public Guid TripId { get; set; } public Guid DriverId { get; set; } public Guid VehicleId { get; set; } }
    private class TrackingStoppedPayload { public Guid TripId { get; set; } public Guid DriverId { get; set; } public Guid VehicleId { get; set; } public string Reason { get; set; } }
    private class LocationUpdatedPayload { public Guid TripId { get; set; } public Guid DriverId { get; set; } public Guid VehicleId { get; set; } public double Latitude { get; set; } public double Longitude { get; set; } public double? Speed { get; set; } public DateTime TimestampUtc { get; set; } }
}
