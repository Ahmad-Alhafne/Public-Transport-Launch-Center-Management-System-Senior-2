namespace BookingService.Api.Controllers;

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookingService.Application.DTOs;
using BookingService.Application.Interfaces;

[ApiController]
[Route("api/[controller]")]
public class BookingController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var bookings = await _bookingService.GetAllBookingsAsync();
        return Ok(bookings);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var booking = await _bookingService.GetBookingByIdAsync(id);
        return Ok(booking);
    }

    [HttpGet("my")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> GetMyBookings()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var bookings = await _bookingService.GetBookingsByPassengerIdAsync(userId);
        return Ok(bookings);
    }

    [HttpGet("my/active")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> GetMyActiveBookings()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var bookings = await _bookingService.GetMyActiveBookingsAsync(userId, token);
        return Ok(bookings);
    }

    [HttpGet("my/history")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> GetMyBookingHistory()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var bookings = await _bookingService.GetMyBookingHistoryAsync(userId, 7, token);
        return Ok(bookings);
    }

    [HttpGet("trip/{tripId:guid}")]
    [Authorize(Roles = "Admin,Auditor")]
    public async Task<IActionResult> GetTripBookings(Guid tripId)
    {
        var bookings = await _bookingService.GetConfirmedBookingsByTripIdAsync(tripId);
        return Ok(bookings);
    }

    [HttpPost]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> Create(CreateBookingDto request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var booking = await _bookingService.CreateBookingAsync(request, userId, token);
        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
    }

    [HttpPost("cancel")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> Cancel(CancelBookingDto request)
    {
        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var booking = await _bookingService.CancelBookingAsync(request, token);
        return Ok(booking);
    }
}
