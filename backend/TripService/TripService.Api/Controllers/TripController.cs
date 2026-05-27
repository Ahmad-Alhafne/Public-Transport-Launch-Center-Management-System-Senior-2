namespace TripService.Api.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripService.Application.DTOs;
using TripService.Application.Interfaces;

[ApiController]
[Route("api/[controller]")]
public class TripController : ControllerBase
{
    private readonly ITripService _tripService;

    public TripController(ITripService tripService)
    {
        _tripService = tripService;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var trips = await _tripService.GetAllTripsAsync();
        return Ok(trips);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var trip = await _tripService.GetTripByIdAsync(id);
        return Ok(trip);
    }

    [HttpGet("driver/{driverId:guid}")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<IActionResult> GetByDriverId(Guid driverId)
    {
        var trips = await _tripService.GetTripsByDriverIdAsync(driverId);
        return Ok(trips);
    }

    [HttpGet("route/{routeId:guid}")]
    [Authorize]
    public async Task<IActionResult> GetByRouteId(Guid routeId)
    {
        var trips = await _tripService.GetTripsByRouteIdAsync(routeId);
        return Ok(trips);
    }

    [HttpGet("active")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetActiveTrips()
    {
        var trips = await _tripService.GetActiveTripsAsync();
        return Ok(trips);
    }

    [HttpGet("history")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetTripHistory([FromQuery] int days = 7)
    {
        var trips = await _tripService.GetTripHistoryAsync(days);
        return Ok(trips);
    }

    [HttpGet("driver/{driverId:guid}/history")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<IActionResult> GetDriverTripHistory(Guid driverId, [FromQuery] int days = 7)
    {
        var trips = await _tripService.GetDriverTripHistoryAsync(driverId, days);
        return Ok(trips);
    }

    [HttpGet("route/{routeId:guid}/exists")]
    [Authorize]
    public async Task<IActionResult> ExistsByRouteId(Guid routeId)
    {
        var exists = await _tripService.TripsExistForRouteAsync(routeId);
        return Ok(new { exists });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateTripDto request)
    {
        var token = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var trip = await _tripService.CreateTripAsync(request, token);
        return CreatedAtAction(nameof(GetById), new { id = trip.Id }, trip);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, UpdateTripDto request)
    {
        var token = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var trip = await _tripService.UpdateTripAsync(id, request, token);
        return Ok(trip);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateTripStatusDto request)
    {
        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var trip = await _tripService.UpdateTripStatusAsync(id, request, token);
        return Ok(trip);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _tripService.DeleteTripAsync(id);
        return NoContent();
    }

    // Internal endpoints for inter-service communication (BookingService calls these)
    [HttpPost("{id:guid}/decrement-seat")]
    [Authorize]
    public async Task<IActionResult> DecrementSeat(Guid id, [FromBody] SeatAdjustmentDto? request)
    {
        var count = request?.Count ?? 1;
        var result = await _tripService.DecrementSeatsAsync(id, count);
        if (!result) return BadRequest("Not enough available seats or trip not found.");
        return Ok();
    }

    [HttpPost("{id:guid}/increment-seat")]
    [Authorize]
    public async Task<IActionResult> IncrementSeat(Guid id, [FromBody] SeatAdjustmentDto? request)
    {
        var count = request?.Count ?? 1;
        var result = await _tripService.IncrementSeatsAsync(id, count);
        if (!result) return BadRequest("Cannot increment seats or trip not found.");
        return Ok();
    }
}
