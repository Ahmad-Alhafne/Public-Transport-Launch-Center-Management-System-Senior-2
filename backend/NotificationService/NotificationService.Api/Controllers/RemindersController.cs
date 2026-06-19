namespace NotificationService.Api.Controllers;

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;

[ApiController]
[Route("api/notification/reminders")]
public class RemindersController : ControllerBase
{
    private readonly IReminderService _reminderService;

    public RemindersController(IReminderService reminderService)
    {
        _reminderService = reminderService;
    }

    [HttpGet("{tripId:guid}")]
    [Authorize]
    public async Task<IActionResult> Get(Guid tripId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var reminder = await _reminderService.GetReminderAsync(tripId, userId, role);
        if (reminder == null) return NotFound();
        return Ok(reminder);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(CreateScheduledReminderDto request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var reminder = await _reminderService.CreateOrUpdateReminderAsync(request, userId, role);
        return Ok(reminder);
    }

    [HttpDelete("{tripId:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid tripId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        await _reminderService.DeleteReminderAsync(tripId, userId, role);
        return NoContent();
    }
}
