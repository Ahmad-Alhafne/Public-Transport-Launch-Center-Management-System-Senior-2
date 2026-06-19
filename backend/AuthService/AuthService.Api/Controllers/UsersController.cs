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
    private readonly IAuditorManagementService _auditorManagementService;
    private readonly IQueueOrganizerManagementService _queueOrganizerManagementService;
    private readonly IUserManagementService _userManagementService;

    public UsersController(
        IUserQueryService userQueryService,
        IDriverManagementService driverManagementService,
        IAuditorManagementService auditorManagementService,
        IUserManagementService userManagementService,
        IQueueOrganizerManagementService queueOrganizerManagementService)
    {
        _userQueryService = userQueryService;
        _driverManagementService = driverManagementService;
        _auditorManagementService = auditorManagementService;
        _userManagementService = userManagementService;
        _queueOrganizerManagementService = queueOrganizerManagementService;
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
    [Authorize(Roles= "Admin")]
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

    // Auditor management
    [HttpGet("auditors")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAuditors()
    {
        var auditors = await _userQueryService.GetAuditorsAsync();
        return Ok(auditors);
    }

    [HttpGet("organizers")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetOrganizers()
    {
        var organizers = await _userManagementService.GetUsersByRoleAsync(Role.QueueOrganizer);
        return Ok(organizers);
    }

    [HttpPost("auditors")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAuditor([FromBody] CreateAuditorDto dto)
    {
        var result = await _auditorManagementService.CreateAuditorAsync(dto);
        return CreatedAtAction(nameof(GetAuditors), new { id = result.Id }, result);
    }

    [HttpPost("organizers")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateOrganizer([FromBody] CreateAuditorDto dto)
    {
        var result = await _queueOrganizerManagementService.CreateQueueOrganizerAsync(dto);
        return CreatedAtAction(nameof(GetOrganizers), new { id = result.Id }, result);
    }

    [HttpPut("auditors/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAuditor(Guid id, [FromBody] UpdateUserDto dto)
    {
        var result = await _auditorManagementService.UpdateAuditorAsync(id, dto);
        return Ok(result);
    }

    [HttpPut("organizers/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrganizer(Guid id, [FromBody] UpdateUserDto dto)
    {
        var result = await _queueOrganizerManagementService.UpdateQueueOrganizerAsync(id, dto);
        return Ok(result);
    }

    [HttpDelete("auditors/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAuditor(Guid id)
    {
        await _auditorManagementService.DeleteAuditorAsync(id);
        return NoContent();
    }

    [HttpDelete("organizers/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteOrganizer(Guid id)
    {
        await _queueOrganizerManagementService.DeleteQueueOrganizerAsync(id);
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

    // Auditor-specific phone/password management
    [HttpPatch("auditors/{id:guid}/phone")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAuditorPhone(Guid id, [FromBody] UpdatePhoneDto dto)
    {
        var result = await _auditorManagementService.UpdateAuditorPhoneAsync(id, dto.PhoneNumber);
        return Ok(result);
    }

    [HttpPatch("organizers/{id:guid}/phone")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrganizerPhone(Guid id, [FromBody] UpdatePhoneDto dto)
    {
        var result = await _queueOrganizerManagementService.UpdateQueueOrganizerPhoneAsync(id, dto.PhoneNumber);
        return Ok(result);
    }

    [HttpPatch("auditors/{id:guid}/password")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAuditorPassword(Guid id, [FromBody] UpdatePasswordDto dto)
    {
        var result = await _auditorManagementService.UpdateAuditorPasswordAsync(id, dto.NewPassword);
        return Ok(result);
    }

    [HttpPatch("organizers/{id:guid}/password")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrganizerPassword(Guid id, [FromBody] UpdatePasswordDto dto)
    {
        var result = await _queueOrganizerManagementService.UpdateQueueOrganizerPasswordAsync(id, dto.NewPassword);
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

