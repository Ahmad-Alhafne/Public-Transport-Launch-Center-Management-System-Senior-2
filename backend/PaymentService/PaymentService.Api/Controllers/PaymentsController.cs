namespace PaymentService.Api.Controllers;

using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaymentService.Application.Features.Payments.Commands;
using PaymentService.Application.Features.Payments.Queries;
using PaymentService.Api.Models;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("create-payment-intent")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> CreatePaymentIntent(CreatePaymentIntentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mediator.Send(new CreatePaymentIntentCommand(request.BookingId, userId, request.Amount, request.Currency, request.PaymentMethod));
        return Ok(result);
    }

    [HttpPost("confirm")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> Confirm(ConfirmPaymentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var expMonth = request.ExpMonth.HasValue ? (long?)request.ExpMonth.Value : null;
        var expYear = request.ExpYear.HasValue ? (long?)request.ExpYear.Value : null;

        var result = await _mediator.Send(new ConfirmPaymentCommand(request.PaymentIntentId, request.CardNumber, expMonth, expYear, request.Cvc, request.PaymentMethodToken));
        return Ok(result);
    }

    [HttpPost("refund")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> Refund([FromBody] RefundPaymentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mediator.Send(new RefundPaymentCommand(request.BookingId, userId, request.Amount, request.Currency));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetPaymentByIdQuery(id));
        return Ok(result);
    }

    [HttpGet("booking/{bookingId:guid}")]
    [Authorize]
    public async Task<IActionResult> GetByBookingId(Guid bookingId)
    {
        var result = await _mediator.Send(new GetPaymentByBookingIdQuery(bookingId));
        if (result == null)
            return NotFound();
        return Ok(result);
    }

    [HttpGet("payment-intent/{paymentIntentId}")]
    [Authorize]
    public async Task<IActionResult> GetByPaymentIntentId(string paymentIntentId)
    {
        var result = await _mediator.Send(new GetPaymentByPaymentIntentIdQuery(paymentIntentId));
        return Ok(result);
    }
}
