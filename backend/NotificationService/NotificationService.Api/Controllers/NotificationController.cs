namespace NotificationService.Api.Controllers;

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;

[ApiController]
[Route("api/notification")]
public class NotificationController : ControllerBase
{
    private readonly INotificationManagementService _notificationService;

    public NotificationController(INotificationManagementService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);
        var notifications = await _notificationService.GetUserNotificationsAsync(userId, role);
        return Ok(notifications);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var notification = await _notificationService.GetNotificationByIdAsync(id);
        return Ok(notification);
    }

    [HttpPatch("{id:guid}/read")]
    [Authorize]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var notification = await _notificationService.MarkAsReadAsync(id);
        return Ok(notification);
    }

    [HttpPatch("read-all")]
    [Authorize]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _notificationService.MarkAllAsReadAsync(userId);
        return NoContent();
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(CreateNotificationDto request)
    {
        var notification = await _notificationService.CreateNotificationAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = notification.Id }, notification);
    }
}
