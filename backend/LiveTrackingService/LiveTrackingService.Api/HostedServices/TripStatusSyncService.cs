using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using System.Threading;
using System.Threading.Tasks;
using LiveTrackingService.Application.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace LiveTrackingService.Api.HostedServices;

public class TripStatusSyncService : BackgroundService
{
    private readonly IServiceProvider _sp;
    private readonly ILogger<TripStatusSyncService> _logger;

    public TripStatusSyncService(IServiceProvider sp, ILogger<TripStatusSyncService> logger)
    {
        _sp = sp;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("TripStatusSyncService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _sp.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<LiveTrackingService.Application.Services.LiveTrackingService>();
                var hub = scope.ServiceProvider.GetRequiredService<IHubContext<LiveTrackingService.Api.Hubs.LiveTrackingHub, LiveTrackingService.Api.Hubs.ILiveTrackingClient>>();
                var factory = scope.ServiceProvider.GetRequiredService<IHttpClientFactory>();

                var client = factory.CreateClient("TripService");

                // attach a short-lived service JWT so TripService accepts the request
                try
                {
                    var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
                    var issuer = configuration["JwtOptions:Issuer"] ?? "DepartureCenter";
                    var audience = configuration["JwtOptions:Audience"] ?? "DepartureCenterUsers";
                    var secret = configuration["JwtOptions:SecretKey"] ?? "THIS_IS_A_LONG_SHARED_SECRET_KEY_123456789";

                    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
                    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
                    var claims = new[] { new Claim(JwtRegisteredClaimNames.Sub, "livetrackingservice"), new Claim(ClaimTypes.Role, "System") };
                    var jwt = new JwtSecurityToken(issuer: issuer, audience: audience, claims: claims, notBefore: DateTime.UtcNow, expires: DateTime.UtcNow.AddMinutes(30), signingCredentials: creds);
                    var token = new JwtSecurityTokenHandler().WriteToken(jwt);
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to create service JWT for TripService calls; requests may be rejected");
                }

                var active = await service.GetActiveAsync();
                foreach (var t in active ?? Enumerable.Empty<LiveTrackingService.Domain.Entities.LiveTripTracking>())
                {
                    try
                    {
                        // call TripService to check status
                        var resp = await client.GetAsync($"/api/trip/{t.TripId}", stoppingToken);
                        if (!resp.IsSuccessStatusCode)
                        {
                            continue;
                        }

                        using var s = await resp.Content.ReadAsStreamAsync(stoppingToken);
                        var doc = await JsonDocument.ParseAsync(s, cancellationToken: stoppingToken);
                        var root = doc.RootElement;
                        string? status = null;
                        if (root.TryGetProperty("status", out var prop) && prop.ValueKind == JsonValueKind.String)
                            status = prop.GetString();

                        if (!string.IsNullOrEmpty(status) && string.Equals(status, "Finished", StringComparison.OrdinalIgnoreCase))
                        {
                            _logger.LogInformation("Trip {TripId} is Finished in TripService — stopping live tracking", t.TripId);
                            await service.StopTrackingAsync(t.TripId);

                            // broadcast finished to clients
                            var dto = new LiveTrackingService.Application.DTOs.TrackingDto { TripId = t.TripId };
                            dto.TrackingStatus = "Finished";
                            try { await hub.Clients.All.ReceiveLocationUpdate(dto); } catch { }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error checking trip {TripId}", t.TripId);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "TripStatusSyncService iteration failed");
            }

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
}
