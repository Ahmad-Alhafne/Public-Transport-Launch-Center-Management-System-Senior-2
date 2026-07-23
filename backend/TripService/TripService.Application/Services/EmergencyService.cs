using System.Net.Http.Headers;
using System.Net.Http.Json;
using TripService.Application.DTOs;
using TripService.Application.Interfaces;
using TripService.Domain.Entities;
using TripService.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace TripService.Application.Services;

public class EmergencyService : IEmergencyService
{
    private readonly IEmergencyRepository _repo;
    private readonly ITripRepository _tripRepo;
    private readonly IBookingServiceClient _bookingClient;
    private readonly string _notificationServiceUrl;
    private readonly ILogger<EmergencyService> _logger;

    public EmergencyService(IEmergencyRepository repo, ITripRepository tripRepo, IBookingServiceClient bookingClient, string notificationServiceUrl, ILogger<EmergencyService> logger)
    {
        _repo = repo;
        _tripRepo = tripRepo;
        _bookingClient = bookingClient;
        _notificationServiceUrl = notificationServiceUrl;
        _logger = logger;
    }

    public async Task<EmergencyDto> CreateEmergencyAsync(CreateEmergencyDto dto, Guid reporterId, string reporterRole, string? jwtToken = null)
    {
        var trip = await _tripRepo.GetByIdAsync(dto.TripId);
        if (trip == null) throw new KeyNotFoundException("Trip not found.");

        // Only allow emergencies for active trips
        if (!(trip.Status == TripStatus.Scheduled || trip.Status == TripStatus.Started || trip.Status == TripStatus.Delayed))
            throw new Exception("Emergencies can only be reported on active trips.");

        // If reporter is citizen, verify they have an active booking for the trip
        if (reporterRole.Equals("Citizen", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(jwtToken))
                throw new UnauthorizedAccessException($"Cannot verify citizen booking for trip {dto.TripId} because the authorization token was not forwarded.");

            var hasBooking = await _bookingClient.UserHasActiveBookingForTripAsync(dto.TripId, dto.BookingId, jwtToken);
            if (!hasBooking)
                throw new UnauthorizedAccessException($"Citizen {reporterId} is not a passenger on trip {dto.TripId}. Cannot report emergency without active booking.");
        }

        var report = new EmergencyReport
        {
            TripId = dto.TripId,
            ReporterId = reporterId,
            ReporterRole = reporterRole,
            Type = dto.Type,
            Priority = dto.Priority,
            Description = dto.Description
        };

        await _repo.AddAsync(report);
        await _repo.SaveChangesAsync();

        // Notify admin role that an emergency has been reported.
        try
        {
            using var http = new HttpClient();
            http.BaseAddress = new Uri(_notificationServiceUrl);
            if (!string.IsNullOrEmpty(jwtToken)) http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);

            var title = $"Emergency Reported: {report.Type}";
            var message = $"Trip {trip.BusNumber} ({trip.Id}) - {report.Type} - Priority: {report.Priority}. Reporter: {reporterRole} {reporterId}.";
            var payload = new { UserId = Guid.Empty, TargetRole = "Admin", Title = title, Message = message, Type = "AdminAnnouncement" };
            var resp = await http.PostAsJsonAsync("api/notification", payload);
            if (!resp.IsSuccessStatusCode)
            {
                _logger?.LogWarning("Failed to post admin notification. Status: {Status}", resp.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger?.LogWarning(ex, "Error sending admin notification for emergency {EmergencyId}", report.Id);
        }

        return MapToDto(report);
    }

    public async Task<IEnumerable<EmergencyDto>> GetAllAsync(EmergencyStatus? status = null, EmergencyPriority? priority = null, EmergencyType? type = null, Guid? tripId = null)
    {
        var list = await _repo.GetAllAsync(status, priority, type, tripId);
        var tripIds = list.Select(e => e.TripId).Distinct().ToList();
        var trips = new Dictionary<Guid, Trip>();

        foreach (var id in tripIds)
        {
            var trip = await _tripRepo.GetByIdAsync(id);
            if (trip != null) trips[id] = trip;
        }

        return list.Select(e => MapToDto(e, trips.TryGetValue(e.TripId, out var trip) ? trip : null));
    }

    public async Task<EmergencyDto> GetByIdAsync(Guid id)
    {
        var r = await _repo.GetByIdAsync(id);
        if (r == null) throw new KeyNotFoundException("Emergency not found.");
        var trip = await _tripRepo.GetByIdAsync(r.TripId);
        return MapToDto(r, trip);
    }

    public async Task<IEnumerable<EmergencyDto>> GetByTripIdAsync(Guid tripId)
    {
        var list = await _repo.GetByTripIdAsync(tripId);
        var trip = await _tripRepo.GetByIdAsync(tripId);
        return list.Select(e => MapToDto(e, trip));
    }

    public async Task<EmergencyDto> UpdateStatusAsync(Guid id, UpdateEmergencyStatusDto dto, string? jwtToken = null)
    {
        var r = await _repo.GetByIdAsync(id);
        if (r == null) throw new KeyNotFoundException("Emergency not found.");
        r.Status = dto.Status;
        r.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(r);
        await _repo.SaveChangesAsync();

        var trip = await _tripRepo.GetByIdAsync(r.TripId);

        // Notify both the trip driver and associated citizens when an emergency status changes.
        if (trip != null)
        {
            // Notify driver directly
            try
            {
                using var http = new HttpClient();
                http.BaseAddress = new Uri(_notificationServiceUrl);
                if (!string.IsNullOrEmpty(jwtToken)) http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);

                var title = $"Emergency Status Updated: {r.Type}";
                var message = $"Trip {trip.BusNumber} ({trip.Id}) emergency status changed to {r.Status}.";
                var payloadDriver = new { UserId = trip.DriverId, TargetRole = (string?)null, Title = title, Message = message, Type = "TripUpdate" };
                var respD = await http.PostAsJsonAsync("api/notification", payloadDriver);
                if (!respD.IsSuccessStatusCode)
                {
                    _logger?.LogWarning("Failed to notify driver for emergency {EmergencyId}. Status: {Status}", r.Id, respD.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Error notifying driver about emergency {EmergencyId}", r.Id);
            }

            // Emergency details are private to the reporting citizen; never broadcast trip-specific data to the role.
            if (r.ReporterRole.Equals("Citizen", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    using var http2 = new HttpClient();
                    http2.BaseAddress = new Uri(_notificationServiceUrl);
                    if (!string.IsNullOrEmpty(jwtToken)) http2.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);

                    var title2 = $"Emergency Update: {r.Type}";
                    var message2 = $"Trip {trip.BusNumber} ({trip.Id}) emergency status is now {r.Status}.";
                    var payloadCitizen = new { UserId = r.ReporterId, TargetRole = (string?)null, Title = title2, Message = message2, Type = "AdminAnnouncement" };
                    var respC = await http2.PostAsJsonAsync("api/notification", payloadCitizen);
                    if (!respC.IsSuccessStatusCode)
                    {
                        _logger?.LogWarning("Failed to notify citizen for emergency {EmergencyId}. Status: {Status}", r.Id, respC.StatusCode);
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Error notifying citizen about emergency {EmergencyId}", r.Id);
                }
            }
        }

        return MapToDto(r, trip);
    }

    private EmergencyDto MapToDto(EmergencyReport r, Trip? trip = null) => new EmergencyDto
    {
        Id = r.Id,
        TripId = r.TripId,
        TripBusNumber = trip?.BusNumber ?? string.Empty,
        TripStatus = trip?.Status,
        ReporterId = r.ReporterId,
        ReporterRole = r.ReporterRole,
        Type = r.Type,
        Priority = r.Priority,
        Status = r.Status,
        Description = r.Description,
        CreatedAt = r.CreatedAt,
        UpdatedAt = r.UpdatedAt
    };
}
