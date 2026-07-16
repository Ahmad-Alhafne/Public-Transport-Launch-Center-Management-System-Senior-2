using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripService.Application.DTOs;
using TripService.Application.Interfaces;
using TripService.Domain.Enums;

[ApiController]
[Route("api/[controller]")]
public class EmergencyController : ControllerBase
{
    private readonly IEmergencyService _service;

    public EmergencyController(IEmergencyService service)
    {
        _service = service;
    }

    [HttpPost]
    [Authorize(Roles = "Driver,Citizen")]
    public async Task<IActionResult> Create(CreateEmergencyDto request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "Citizen";
        var token = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var created = await _service.CreateEmergencyAsync(request, userId, role, token);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] EmergencyStatus? status, [FromQuery] EmergencyPriority? priority, [FromQuery] EmergencyType? type, [FromQuery] Guid? tripId)
    {
        var list = await _service.GetAllAsync(status, priority, type, tripId);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var e = await _service.GetByIdAsync(id);
        return Ok(e);
    }

    [HttpGet("trip/{tripId:guid}")]
    [Authorize]
    public async Task<IActionResult> GetByTrip(Guid tripId)
    {
        var list = await _service.GetByTripIdAsync(tripId);
        return Ok(list);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateEmergencyStatusDto request)
    {
        var token = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var updated = await _service.UpdateStatusAsync(id, request, token);
        return Ok(updated);
    }
}
