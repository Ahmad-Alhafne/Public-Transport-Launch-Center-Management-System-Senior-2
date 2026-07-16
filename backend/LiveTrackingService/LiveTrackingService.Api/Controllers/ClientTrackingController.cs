using System;
using System.Threading.Tasks;
using LiveTrackingService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace LiveTrackingService.Api.Controllers;

[ApiController]
[Route("api/tracking")]
public class ClientTrackingController : ControllerBase
{
    private readonly LiveTrackingService.Application.Services.LiveTrackingService _service;
    private readonly IHttpClientFactory _httpFactory;
    private readonly IConfiguration _config;

    public ClientTrackingController(LiveTrackingService.Application.Services.LiveTrackingService service, IHttpClientFactory httpFactory, IConfiguration config)
    {
        _service = service;
        _httpFactory = httpFactory;
        _config = config;
    }

    [HttpGet("active")]
    [Authorize]
    public async Task<IActionResult> GetActive()
    {
        var active = (await _service.GetActiveAsync())?.ToList() ?? new List<Domain.Entities.LiveTripTracking>();

        if (!active.Any()) return Ok(active);

        // Resolve driver names via AuthService (GetUser is AllowAnonymous) and trip info via TripService
        var authClient = _httpFactory.CreateClient("AuthService");
        var tripClient = _httpFactory.CreateClient("TripService");

        // attach service JWT to TripService client
        try
        {
            var issuer = _config["JwtOptions:Issuer"] ?? "DepartureCenter";
            var audience = _config["JwtOptions:Audience"] ?? "DepartureCenterUsers";
            var secret = _config["JwtOptions:SecretKey"] ?? "THIS_IS_A_LONG_SHARED_SECRET_KEY_123456789";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[] { new Claim(JwtRegisteredClaimNames.Sub, "livetrackingservice"), new Claim(ClaimTypes.Role, "System") };
            var jwt = new JwtSecurityToken(issuer: issuer, audience: audience, claims: claims, notBefore: DateTime.UtcNow, expires: DateTime.UtcNow.AddMinutes(30), signingCredentials: creds);
            var token = new JwtSecurityTokenHandler().WriteToken(jwt);
            tripClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }
        catch { /* best-effort; TripService will reject if token invalid */ }

        var tripIds = active.Select(a => a.TripId).Where(id => id != Guid.Empty).Distinct().ToList();
        var driverIds = active.Select(a => a.DriverId).Where(id => id != Guid.Empty).Distinct().ToList();

        var tripsById = new Dictionary<Guid, JsonElement>();
        foreach (var id in tripIds)
        {
            try
            {
                var resp = await tripClient.GetAsync($"api/trip/{id}");
                if (resp.IsSuccessStatusCode)
                {
                    var trip = await resp.Content.ReadFromJsonAsync<JsonElement>();
                    tripsById[id] = trip;
                }
            }
            catch { }
        }

        var driversById = new Dictionary<Guid, JsonElement>();
        foreach (var id in driverIds)
        {
            try
            {
                var resp = await authClient.GetAsync($"api/users/{id}");
                if (resp.IsSuccessStatusCode)
                {
                    var user = await resp.Content.ReadFromJsonAsync<JsonElement>();
                    driversById[id] = user;
                }
            }
            catch { }
        }

        // build enriched response objects expected by frontend
        var enriched = active.Select(a => {
            tripsById.TryGetValue(a.TripId, out var tripElem);
            driversById.TryGetValue(a.DriverId, out var driverElem);

            string driverName = null;
            if (driverElem.ValueKind == JsonValueKind.Object)
            {
                driverName = ExtractStringValue(driverElem, "fullName", "FullName", "name", "Name", "displayName", "display_name", "username", "userName");
            }

            string tripNumber = null;
            string vehiclePlate = null;
            int? reservedSeats = null;
            if (tripElem.ValueKind == JsonValueKind.Object)
            {
                tripNumber = ExtractStringValue(tripElem, "tripNumber", "TripNumber", "busNumber", "BusNumber", "busNo", "BusNo", "tripNo", "TripNo", "number", "Number", "id");
                vehiclePlate = ExtractStringValue(tripElem, "vehiclePlate", "VehiclePlate", "plate", "Plate", "vehicleNumber", "VehicleNumber", "registrationNumber", "RegistrationNumber");

                var total = ExtractIntValue(tripElem, "totalSeats", "TotalSeats", "seatCount", "SeatCount", "capacity", "Capacity");
                var available = ExtractIntValue(tripElem, "availableSeats", "AvailableSeats", "available", "Available");
                if (total.HasValue && available.HasValue)
                {
                    reservedSeats = total.Value - available.Value;
                }
                else
                {
                    reservedSeats = ExtractIntValue(tripElem, "reservedSeats", "ReservedSeats", "reserved", "Reserved");
                }
            }

            return new {
                tripId = a.TripId,
                tripNumber,
                driverId = a.DriverId,
                driverName,
                vehicleId = a.VehicleId,
                vehiclePlate = vehiclePlate ?? a.VehicleId.ToString(),
                reservedSeats,
                currentLatitude = a.CurrentLatitude,
                currentLongitude = a.CurrentLongitude,
                currentSpeed = a.CurrentSpeed,
                lastUpdatedAt = a.LastUpdatedAt,
                status = a.TrackingStatus
            };
        }).ToList();

        return Ok(enriched);
    }

    [HttpGet("{tripId:guid}")]
    [Authorize]
    public async Task<IActionResult> GetCurrent(Guid tripId)
    {
        var current = await _service.GetActiveAsync();
        var match = current?.FirstOrDefault(t => t.TripId == tripId);
        if (match == null) return NotFound();
        return Ok(match);
    }

    [HttpGet("{tripId:guid}/history")]
    [Authorize]
    public async Task<IActionResult> GetHistory(Guid tripId, [FromQuery] int limit = 100)
    {
        var history = await _service.GetHistoryAsync(tripId, limit);
        return Ok(history);
    }

    // Helper: extract first matching string property from JsonElement
    private static string? ExtractStringValue(JsonElement elem, params string[] names)
    {
        foreach (var n in names)
        {
            if (elem.TryGetProperty(n, out var v) && v.ValueKind == JsonValueKind.String)
                return v.GetString();
        }
        // sometimes ids are GUIDs returned as strings or numbers
        foreach (var n in names)
        {
            if (elem.TryGetProperty(n, out var v))
            {
                if (v.ValueKind == JsonValueKind.Number && v.TryGetInt64(out var num))
                    return num.ToString();
                if (v.ValueKind == JsonValueKind.String)
                    return v.GetString();
            }
        }
        return null;
    }

    // Helper: extract first matching int property from JsonElement
    private static int? ExtractIntValue(JsonElement elem, params string[] names)
    {
        foreach (var n in names)
        {
            if (elem.TryGetProperty(n, out var v))
            {
                if (v.ValueKind == JsonValueKind.Number && v.TryGetInt32(out var i)) return i;
                if (v.ValueKind == JsonValueKind.String && int.TryParse(v.GetString(), out var pi)) return pi;
            }
        }
        return null;
    }
}
