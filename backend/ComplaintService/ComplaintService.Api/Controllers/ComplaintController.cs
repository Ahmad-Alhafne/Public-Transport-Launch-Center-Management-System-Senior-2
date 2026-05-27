namespace ComplaintService.Api.Controllers;

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ComplaintService.Application.DTOs;
using ComplaintService.Application.Interfaces;

[ApiController]
[Route("api/[controller]")]
public class ComplaintController : ControllerBase
{
    private readonly IComplaintService _complaintService;

    public ComplaintController(IComplaintService complaintService)
    {
        _complaintService = complaintService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var complaints = await _complaintService.GetAllComplaintsAsync();
        return Ok(complaints);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var complaint = await _complaintService.GetComplaintByIdAsync(id);
        return Ok(complaint);
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyComplaints()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var complaints = await _complaintService.GetComplaintsByUserIdAsync(userId);
        return Ok(complaints);
    }

    [HttpPost]
    [Authorize(Roles = "Citizen,Driver")]
    public async Task<IActionResult> Create(CreateComplaintDto request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var userName = User.FindFirstValue("FullName") ?? "Unknown";
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "Unknown";
        var complaint = await _complaintService.CreateComplaintAsync(request, userId, userName, userRole);
        return CreatedAtAction(nameof(GetById), new { id = complaint.Id }, complaint);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateComplaintStatusDto request)
    {
        var complaint = await _complaintService.UpdateComplaintStatusAsync(id, request);
        return Ok(complaint);
    }

    [HttpPatch("{id:guid}/respond")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Respond(Guid id, RespondToComplaintDto request)
    {
        var complaint = await _complaintService.RespondToComplaintAsync(id, request);
        return Ok(complaint);
    }
}
