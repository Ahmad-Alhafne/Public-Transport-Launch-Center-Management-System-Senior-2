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
            tripsById.TryGetValue(a.TripId, out var tripObj);
            driversById.TryGetValue(a.DriverId, out var driverObj);

            string driverName = null;
            if (driversById.TryGetValue(a.DriverId, out var driverElem) && driverElem.ValueKind == JsonValueKind.Object)
            {
                if (driverElem.TryGetProperty("fullName", out var p) && p.ValueKind == JsonValueKind.String) driverName = p.GetString();
                else if (driverElem.TryGetProperty("FullName", out p) && p.ValueKind == JsonValueKind.String) driverName = p.GetString();
                else if (driverElem.TryGetProperty("name", out p) && p.ValueKind == JsonValueKind.String) driverName = p.GetString();
                else if (driverElem.TryGetProperty("displayName", out p) && p.ValueKind == JsonValueKind.String) driverName = p.GetString();
            }

            string tripNumber = null;
            int? reservedSeats = null;
            if (tripsById.TryGetValue(a.TripId, out var tripElem) && tripElem.ValueKind == JsonValueKind.Object)
            {
                if (tripElem.TryGetProperty("busNumber", out var bp) && bp.ValueKind == JsonValueKind.String) tripNumber = bp.GetString();
                else if (tripElem.TryGetProperty("BusNumber", out bp) && bp.ValueKind == JsonValueKind.String) tripNumber = bp.GetString();
                else if (tripElem.TryGetProperty("id", out bp) && bp.ValueKind == JsonValueKind.String) tripNumber = bp.GetString();

                int? total = null;
                int? avail = null;
                if (tripElem.TryGetProperty("totalSeats", out var ts) && ts.ValueKind == JsonValueKind.Number && ts.TryGetInt32(out var tsi)) total = tsi;
                else if (tripElem.TryGetProperty("TotalSeats", out ts) && ts.ValueKind == JsonValueKind.Number && ts.TryGetInt32(out tsi)) total = tsi;

                if (tripElem.TryGetProperty("availableSeats", out var asv) && asv.ValueKind == JsonValueKind.Number && asv.TryGetInt32(out var asvi)) avail = asvi;
                else if (tripElem.TryGetProperty("AvailableSeats", out asv) && asv.ValueKind == JsonValueKind.Number && asv.TryGetInt32(out asvi)) avail = asvi;

                if (total.HasValue && avail.HasValue) reservedSeats = total.Value - avail.Value;
            }

            return new {
                tripId = a.TripId,
                tripNumber,
                driverId = a.DriverId,
                driverName,
                vehicleId = a.VehicleId,
                vehiclePlate = a.VehicleId.ToString(),
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
}
