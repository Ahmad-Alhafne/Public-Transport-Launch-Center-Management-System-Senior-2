namespace TripService.Api.Controllers;

using TripService.Application.DTOs;
using TripService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/driver/profile")]
public class DriverProfileController : ControllerBase
{
    private readonly IDriverProfileService _driverProfileService;

    public DriverProfileController(IDriverProfileService driverProfileService)
    {
        _driverProfileService = driverProfileService;
    }

    [HttpGet("{driverId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetDriverProfile(Guid driverId)
    {
        var profile = await _driverProfileService.GetDriverProfileAsync(driverId);
        return profile == null ? NotFound() : Ok(profile);
    }

    [HttpGet("me")]
    [Authorize(Roles = "Driver")]
    public async Task<IActionResult> GetMyProfile()
    {
        var driverId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
        var profile = await _driverProfileService.GetDriverProfileAsync(driverId);
        return profile == null ? NotFound() : Ok(profile);
    }

    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllProfiles()
    {
        var profiles = await _driverProfileService.GetAllDriverProfilesAsync();
        return Ok(profiles);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateProfile([FromBody] CreateDriverProfileDto dto)
    {
        var profile = await _driverProfileService.CreateDriverProfileAsync(dto);
        return CreatedAtAction(nameof(GetDriverProfile), new { driverId = profile.DriverId }, profile);
    }

    [HttpPut("{driverId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateProfile(Guid driverId, [FromBody] UpdateDriverProfileDto dto)
    {
        var profile = await _driverProfileService.UpdateDriverProfileAsync(driverId, dto);
        return Ok(profile);
    }

    [HttpPut("me")]
    [Authorize(Roles = "Driver")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateDriverProfileDto dto)
    {
        var driverId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
        var profile = await _driverProfileService.UpdateDriverProfileAsync(driverId, dto);
        return Ok(profile);
    }

    [HttpDelete("{driverId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProfile(Guid driverId)
    {
        await _driverProfileService.DeleteDriverProfileAsync(driverId);
        return NoContent();
    }

    [HttpDelete("me")]
    [Authorize(Roles = "Driver")]
    public async Task<IActionResult> DeleteMyProfile()
    {
        var driverId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
        await _driverProfileService.DeleteDriverProfileAsync(driverId);
        return NoContent();
    }
}
