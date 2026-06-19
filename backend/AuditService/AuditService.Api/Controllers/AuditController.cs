using AuditService.Application.DTOs;
using AuditService.Application.Services;
using AuditService.Domain.Entities;
using AuditService.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using AuditService.Application.Interfaces;
using System;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace AuditService.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditController : ControllerBase
    {
        private readonly AuditService.Application.Services.AuditService _auditService;
        private readonly AuditService.Application.Interfaces.IBookingServiceClient _bookingClient;
        private readonly AuditService.Application.Interfaces.ITripServiceClient _tripClient;
        private readonly AuditService.Application.Interfaces.IAuditRepository _auditRepo;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuditController> _logger;

        public AuditController(AuditService.Application.Services.AuditService auditService, AuditService.Application.Interfaces.IBookingServiceClient bookingClient, AuditService.Application.Interfaces.ITripServiceClient tripClient, AuditService.Application.Interfaces.IAuditRepository auditRepo, IConfiguration configuration, ILogger<AuditController> logger)
        {
            _auditService = auditService;
            _bookingClient = bookingClient;
            _tripClient = tripClient;
            _auditRepo = auditRepo;
            _logger = logger;
            _configuration = configuration;
        }

        [HttpGet("available-trips")]
        [Authorize(Roles = "Auditor")]
        public async Task<IActionResult> GetAvailableTrips()
        {
            // Get all trips from TripService; forward caller token for authentication
            IEnumerable<TripDto>? trips = null;
            try
            {
                var authHeader = Request.Headers["Authorization"].ToString();
                var token = string.IsNullOrWhiteSpace(authHeader) ? null : authHeader;
                trips = await _tripClient.GetAllTripsAsync(token);
                if (trips == null)
                {
                    _logger?.LogWarning("TripService returned null when fetching trips. TripService may be unreachable or returned non-success status.");
                    return StatusCode(502, new { message = "Failed to fetch trips from TripService" });
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to fetch trips from TripService");
                return StatusCode(502, new { message = "Failed to fetch trips from TripService" });
            }

            var now = DateTime.UtcNow;
            var available = new List<object>();

            foreach (var trip in trips)
            {
                // Only future trips
                if (trip.DepartureTime <= now) continue;

                // Skip if there's an active TripAudit (not cancelled/completed)
                TripAudit? existing = null;
                try
                {
                    existing = await _auditRepo.GetTripAuditForTripAsync(trip.Id);
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Audit DB check failed for trip {TripId}, including trip in available list", trip.Id);
                    // If repo fails, assume no audit exists for resiliency
                    existing = null;
                }
                if (existing != null) continue;

                available.Add(new
                {
                    id = trip.Id,
                    routeName = trip.BusNumber,
                    departureUtc = trip.DepartureTime,
                    vehicle = trip.VehicleId,
                    driver = trip.DriverId,
                    availableSeats = trip.AvailableSeats
                });
            }

            return Ok(available);
        }

        [HttpPost("pick-trip")]
        [Authorize(Roles = "Auditor")]
        public async Task<IActionResult> PickTrip([FromQuery] Guid tripId)
        {
            var auditorIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (auditorIdClaim == null) return Unauthorized();

            if (!Guid.TryParse(auditorIdClaim, out var auditorId)) return Unauthorized();

            var ok = await _auditService.TryAssignTripAsync(tripId, auditorId);
            if (!ok) return Conflict(new { message = "Trip already assigned" });
            return Ok(new { message = "Assigned" });
        }

        [HttpGet("assigned-trip")]
        [Authorize(Roles = "Auditor")]
        public async Task<IActionResult> GetAssignedTrips()
        {
            var auditorIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (auditorIdClaim == null) return Unauthorized();
            if (!Guid.TryParse(auditorIdClaim, out var auditorId)) return Unauthorized();

            try
            {
                var audits = await _auditRepo.GetAssignedTripsForAuditorAsync(auditorId);
                var result = new List<object>();
                foreach (var a in audits)
                {
                    result.Add(new { id = a.Id, tripId = a.TripId, assignedAt = a.AssignedAt, status = a.Status });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get assigned trips for auditor {AuditorId}", auditorId);
                return StatusCode(500, new { message = "Failed to fetch assigned trips" });
            }
        }

        [HttpPost("scan")]
        [Authorize(Roles = "Auditor")]
        public async Task<IActionResult> Scan([FromBody] AuditRecordDto dto)
        {
            var auditorIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (auditorIdClaim == null) return Unauthorized();
            if (!Guid.TryParse(auditorIdClaim, out var auditorId)) return Unauthorized();

            var record = new AuditRecord
            {
                Id = Guid.NewGuid(),
                BookingId = dto.BookingId,
                CitizenId = dto.CitizenId,
                TripId = dto.TripId,
                AuditorId = auditorId,
                ScanTime = DateTime.UtcNow,
                Result = dto.Result,
                Notes = dto.Notes
            };

            await _auditService.AddRecordAsync(record);

            return Ok(new { message = "Recorded", id = record.Id });
        }

        [HttpPost("validate")]
        [Authorize(Roles = "Auditor")]
        public async Task<IActionResult> Validate([FromBody] ValidateQrRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Token))
                return BadRequest(new { message = "Token is required" });

            // Split token
            var parts = request.Token.Split('.');
            if (parts.Length != 2) return BadRequest(new { message = "Invalid token format" });

            static byte[] Base64UrlDecode(string input)
            {
                string s = input.Replace('-', '+').Replace('_', '/');
                switch (s.Length % 4)
                {
                    case 2: s += "=="; break;
                    case 3: s += "="; break;
                }
                return Convert.FromBase64String(s);
            }

            byte[] payloadBytes;
            byte[] sigBytes;
            try
            {
                payloadBytes = Base64UrlDecode(parts[0]);
                sigBytes = Base64UrlDecode(parts[1]);
            }
            catch
            {
                return BadRequest(new { message = "Invalid base64 in token" });
            }

            var payload = System.Text.Encoding.UTF8.GetString(payloadBytes);
            // payload format: bookingId|citizenId|tripId|bookedAt
            var pparts = payload.Split('|');
            if (pparts.Length != 4) return BadRequest(new { message = "Invalid payload format" });

            if (!Guid.TryParse(pparts[0], out var bookingId) || !Guid.TryParse(pparts[1], out var citizenId) || !Guid.TryParse(pparts[2], out var tripId) || !DateTime.TryParse(pparts[3], out var bookedAt))
            {
                return BadRequest(new { message = "Invalid payload values" });
            }

            var secret = _configuration["QrOptions:Secret"] ?? _configuration["JwtOptions:SecretKey"] ?? string.Empty;
            if (string.IsNullOrEmpty(secret)) return StatusCode(500, new { message = "Server misconfigured for QR validation" });

            using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(secret));
            var expected = hmac.ComputeHash(payloadBytes);

            bool validSig = expected.Length == sigBytes.Length && CryptographicOperations.FixedTimeEquals(expected, sigBytes);
            if (!validSig)
            {
                return Ok(new ValidateQrResponse { Result = AuditResult.InvalidQRCode, Message = "Signature mismatch" });
            }

            // Retrieve booking from BookingService
            var booking = await _bookingClient.GetBookingAsync(bookingId);
            if (booking == null)
            {
                return Ok(new ValidateQrResponse { BookingId = bookingId, Result = AuditResult.InvalidQRCode, Message = "Booking not found" });
            }

            // Validate booking details
            if (booking.PassengerId != citizenId)
            {
                return Ok(new ValidateQrResponse { BookingId = bookingId, CitizenId = citizenId, Result = AuditResult.WrongTrip, Message = "QR belongs to another passenger" });
            }

            if (booking.TripId != tripId)
            {
                return Ok(new ValidateQrResponse { BookingId = bookingId, TripId = tripId, Result = AuditResult.WrongTrip, Message = "QR belongs to another trip" });
            }

            // Check booking status
            if (!string.Equals(booking.Status, "Confirmed", StringComparison.OrdinalIgnoreCase))
            {
                return Ok(new ValidateQrResponse { BookingId = bookingId, Result = AuditResult.Rejected, Message = "Booking not valid" });
            }

            // Check that the token stored matches (prevents tampering)
            if (!string.Equals(booking.QrToken, request.Token, StringComparison.Ordinal))
            {
                return Ok(new ValidateQrResponse { BookingId = bookingId, Result = AuditResult.InvalidQRCode, Message = "Token does not match booking record" });
            }

            // Check not past departure
            if (DateTime.UtcNow > booking.TripDepartureTimeUtc)
            {
                return Ok(new ValidateQrResponse { BookingId = bookingId, TripId = tripId, Result = AuditResult.Rejected, Message = "Trip already departed" });
            }

            return Ok(new ValidateQrResponse { BookingId = bookingId, CitizenId = citizenId, TripId = tripId, BookedAt = bookedAt, Result = AuditResult.Approved, PassengerName = booking.PassengerName, Message = "Valid" });
        }
    }
}
