namespace AuthService.Api.Controllers;

using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserQueryService _userQueryService;
    private readonly IDriverManagementService _driverManagementService;
    private readonly IUserManagementService _userManagementService;

    public UsersController(
        IUserQueryService userQueryService,
        IDriverManagementService driverManagementService,
        IUserManagementService userManagementService)
    {
        _userQueryService = userQueryService;
        _driverManagementService = driverManagementService;
        _userManagementService = userManagementService;
    }

    // Driver management
    [HttpGet("drivers")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetDrivers()
    {
        var drivers = await _userQueryService.GetDriversAsync();
        return Ok(drivers);
    }

    [HttpPost("drivers")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateDriver([FromBody] CreateDriverDto dto)
    {
        var result = await _driverManagementService.CreateDriverAsync(dto);
        return CreatedAtAction(nameof(GetDrivers), new { id = result.Id }, result);
    }

    [HttpPut("drivers/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateDriver(Guid id, [FromBody] UpdateDriverDto dto)
    {
        var result = await _driverManagementService.UpdateDriverAsync(id, dto);
        return Ok(result);
    }

    [HttpDelete("drivers/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteDriver(Guid id)
    {
        await _driverManagementService.DeleteDriverAsync(id);
        return NoContent();
    }

    // User management
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers([FromQuery] string? role)
    {
        if (!string.IsNullOrWhiteSpace(role) && Enum.TryParse<Role>(role, true, out var parsedRole))
        {
            var users = await _userManagementService.GetUsersByRoleAsync(parsedRole);
            return Ok(users);
        }

        var allUsers = await _userManagementService.GetAllUsersAsync();
        return Ok(allUsers);
    }

    [HttpPost("by-ids")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsersByIds([FromBody] GetUsersByIdsDto dto)
    {
        var users = await _userManagementService.GetUsersByIdsAsync(dto.UserIds);
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUser(Guid id)
    {
        var user = await _userManagementService.GetUserByIdAsync(id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        var result = await _userManagementService.UpdateUserAsync(id, dto);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        await _userManagementService.DeleteUserAsync(id);
        return NoContent();
    }

    // User profile (any authenticated user)
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
        var profile = await _userManagementService.GetMyProfileAsync(userId);
        return Ok(profile);
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfile([FromBody] AdminProfileDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
        var profile = await _userManagementService.UpdateMyProfileAsync(userId, dto);
        return Ok(profile);
    }

    [HttpPatch("{id:guid}/phone")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUserPhone(Guid id, [FromBody] UpdatePhoneDto dto)
    {
        var result = await _driverManagementService.UpdateUserPhoneAsync(id, dto.PhoneNumber);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/password")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUserPassword(Guid id, [FromBody] UpdatePasswordDto dto)
    {
        var result = await _driverManagementService.UpdateUserPasswordAsync(id, dto.NewPassword);
        return Ok(result);
    }

    // Admin contact for drivers
    [HttpGet("admin-contact")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<IActionResult> GetAdminContact()
    {
        var admins = await _userManagementService.GetUsersByRoleAsync(Role.Admin);
        if (admins.Any())
        {
            var admin = admins.First();
            return Ok(new { phone = admin.PhoneNumber, email = admin.Email });
        }
        return NotFound("No admin contact available");
    }
}

