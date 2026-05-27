namespace TripService.Api.Controllers;

using TripService.Application.DTOs;
using TripService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/driver/change-requests")]
public class DriverChangeRequestController : ControllerBase
{
    private readonly IDriverChangeRequestService _changeRequestService;

    public DriverChangeRequestController(IDriverChangeRequestService changeRequestService)
    {
        _changeRequestService = changeRequestService;
    }

    [HttpPost]
    [Authorize(Roles = "Driver")]
    public async Task<IActionResult> SubmitRequest([FromBody] CreateDriverChangeRequestDto dto)
    {
        var driverId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
        var request = await _changeRequestService.CreateRequestAsync(driverId, dto);
        return CreatedAtAction(nameof(GetRequest), new { requestId = request.Id }, request);
    }

    [HttpGet("my")]
    [Authorize(Roles = "Driver")]
    public async Task<IActionResult> GetMyRequests()
    {
        var driverId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
        var requests = await _changeRequestService.GetMyRequestsAsync(driverId);
        return Ok(requests);
    }

    [HttpGet("{requestId:guid}")]
    [Authorize(Roles = "Driver,Admin")]
    public async Task<IActionResult> GetRequest(Guid requestId)
    {
        var request = await _changeRequestService.GetRequestAsync(requestId);
        return request == null ? NotFound() : Ok(request);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllRequests()
    {
        var requests = await _changeRequestService.GetAllRequestsAsync();
        return Ok(requests);
    }

    [HttpPatch("{requestId:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRequestStatus(Guid requestId, [FromBody] UpdateDriverChangeRequestStatusDto dto)
    {
        var request = await _changeRequestService.UpdateRequestStatusAsync(requestId, dto);
        return Ok(request);
    }
}
