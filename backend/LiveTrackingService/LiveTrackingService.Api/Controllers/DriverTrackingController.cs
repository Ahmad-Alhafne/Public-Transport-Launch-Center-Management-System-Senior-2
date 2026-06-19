using System.Threading.Tasks;
using LiveTrackingService.Application.DTOs;
using LiveTrackingService.Application.Services;
using LiveTrackingService.Api.Hubs;
using LiveTrackingService.Api.Messaging;
using LiveTrackingService.Application.IntegrationEvents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace LiveTrackingService.Api.Controllers;

[ApiController]
[Route("api/driver/tracking")]
public class DriverTrackingController : ControllerBase
{
    private readonly LiveTrackingService.Application.Services.LiveTrackingService _service;
    private readonly IRabbitMqEventPublisher _publisher;
    private readonly IHubContext<LiveTrackingHub, ILiveTrackingClient> _hubContext;
    private readonly Microsoft.Extensions.Logging.ILogger<DriverTrackingController> _logger;

    public DriverTrackingController(LiveTrackingService.Application.Services.LiveTrackingService service, IRabbitMqEventPublisher publisher, IHubContext<LiveTrackingHub, ILiveTrackingClient> hubContext, Microsoft.Extensions.Logging.ILogger<DriverTrackingController> logger)
    {
        _service = service;
        _publisher = publisher;
        _hubContext = hubContext;
        _logger = logger;
    }

    [HttpPost("start")]
    [Authorize(Roles = "Driver")]
    public async Task<IActionResult> StartTracking([FromBody] TrackingDto dto)
    {
        // Mark tracking active in DB
        await _service.UpdateLocationAsync(dto);

        // Publish event
        var ev = new TrackingStartedEvent { TripId = dto.TripId, DriverId = dto.DriverId, VehicleId = dto.VehicleId };
        await _publisher.PublishAsync(ev);

        // Broadcast to SignalR clients so UI updates immediately
        try
        {
            dto.TrackingStatus = "Active";
            _logger.LogInformation("Broadcasting ReceiveLocationUpdate (start) for Trip {TripId}", dto.TripId);
            await _hubContext.Clients.All.ReceiveLocationUpdate(dto);
        }
        catch (System.Exception ex)
        {
            _logger.LogWarning(ex, "SignalR broadcast failed for StartTracking {TripId}", dto.TripId);
        }

        return Ok(new { success = true });
    }

    [HttpPost("stop")]
    [Authorize(Roles = "Driver")]
    public async Task<IActionResult> StopTracking([FromBody] TrackingDto dto)
    {
        // Mark tracking finished in DB if exists
        try
        {
            await _service.StopTrackingAsync(dto.TripId);
        }
        catch
        {
            // swallow to avoid failing API
        }

        // Publish stop event
        var ev = new TrackingStoppedEvent { TripId = dto.TripId, DriverId = dto.DriverId, VehicleId = dto.VehicleId, Reason = "StoppedByDriver" };
        await _publisher.PublishAsync(ev);

        // notify SignalR clients about finished status
        try
        {
            dto.TrackingStatus = "Finished";
            _logger.LogInformation("Broadcasting ReceiveLocationUpdate (stop) for Trip {TripId}", dto.TripId);
            await _hubContext.Clients.All.ReceiveLocationUpdate(dto);
        }
        catch (System.Exception ex)
        {
            _logger.LogWarning(ex, "SignalR broadcast failed for StopTracking {TripId}", dto.TripId);
        }

        return Ok(new { success = true });
    }

    [HttpPost("update")]
    [Authorize(Roles = "Driver")]
    public async Task<IActionResult> UpdateLocation([FromBody] TrackingDto dto)
    {
        await _service.UpdateLocationAsync(dto);

        // Publish location updated event to RabbitMQ
        var ev = new LocationUpdatedEvent
        {
            TripId = dto.TripId,
            DriverId = dto.DriverId,
            VehicleId = dto.VehicleId,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Speed = dto.Speed,
            TimestampUtc = dto.Timestamp == default ? DateTime.UtcNow : dto.Timestamp
        };

        await _publisher.PublishAsync(ev);

        // Broadcast to SignalR clients
        try
        {
            _logger.LogInformation("Broadcasting ReceiveLocationUpdate (update) for Trip {TripId}", dto.TripId);
            await _hubContext.Clients.All.ReceiveLocationUpdate(dto);
        }
        catch (System.Exception ex)
        {
            _logger.LogWarning(ex, "SignalR broadcast failed for UpdateLocation {TripId}", dto.TripId);
        }

        return Ok(new { success = true });
    }
}
