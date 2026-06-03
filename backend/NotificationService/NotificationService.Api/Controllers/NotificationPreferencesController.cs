namespace NotificationService.Api.Controllers;

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;

[ApiController]
[Route("api/notification/preferences")]
public class NotificationPreferencesController : ControllerBase
{
    private readonly INotificationPreferenceService _preferenceService;

    public NotificationPreferencesController(INotificationPreferenceService preferenceService)
    {
        _preferenceService = preferenceService;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetPreferences()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var preferences = await _preferenceService.GetPreferencesAsync(userId, role);
        return Ok(preferences);
    }

    [HttpPut]
    [Authorize]
    public async Task<IActionResult> UpdatePreferences(UpdateNotificationPreferenceDto request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var preferences = await _preferenceService.UpdatePreferencesAsync(userId, role, request);
        return Ok(preferences);
    }
}
