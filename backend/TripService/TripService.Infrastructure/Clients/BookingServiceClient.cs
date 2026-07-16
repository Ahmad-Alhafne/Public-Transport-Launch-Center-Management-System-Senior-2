using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TripService.Application.Interfaces;

namespace TripService.Infrastructure.Clients;

public class BookingServiceClient : IBookingServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly string _bookingServiceUrl;

    public BookingServiceClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _bookingServiceUrl = configuration["BookingServiceUrl"]
            ?? configuration["ServiceUrls:BookingServiceUrl"]
            ?? configuration["ServiceUrls:BookingService"]
            ?? "http://localhost:5004";
    }

    public async Task<bool> UserHasActiveBookingForTripAsync(Guid tripId, Guid? bookingId = null, string? jwtToken = null)
    {
        var bookingUrl = $"{_bookingServiceUrl.TrimEnd('/')}/api/booking/my";
        var activeBookingUrl = $"{_bookingServiceUrl.TrimEnd('/')}/api/booking/my/active";

        var (isSuccess, json, status) = await SendBookingRequestAsync(bookingUrl, jwtToken);
        if (!isSuccess)
        {
            if (status == HttpStatusCode.NotFound)
            {
                (isSuccess, json, status) = await SendBookingRequestAsync(activeBookingUrl, jwtToken);
            }
        }

        if (!isSuccess)
        {
            if (status == HttpStatusCode.Unauthorized || status == HttpStatusCode.Forbidden)
                throw new UnauthorizedAccessException($"BookingService returned {status} while verifying booking for trip {tripId}. Response body: {json}");

            return false;
        }

        try
        {
            var arr = JsonDocument.Parse(json).RootElement;
            if (arr.ValueKind != JsonValueKind.Array)
                return false;

            foreach (var el in arr.EnumerateArray())
            {
                if (bookingId.HasValue)
                {
                    if (TryGetBookingId(el, out var bid) && bid == bookingId.Value && TryGetTripId(el, out var tid) && tid == tripId && IsConfirmedBooking(el))
                        return true;
                }
                else if (TryGetTripId(el, out var tid) && tid == tripId && IsConfirmedBooking(el))
                {
                    return true;
                }
            }
        }
        catch (JsonException)
        {
            return false;
        }

        return false;
    }

    private async Task<(bool isSuccess, string content, HttpStatusCode status)> SendBookingRequestAsync(string url, string? jwtToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        if (!string.IsNullOrEmpty(jwtToken))
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        var resp = await _httpClient.SendAsync(request);
        var json = await resp.Content.ReadAsStringAsync();
        return (resp.IsSuccessStatusCode, json, resp.StatusCode);
    }

    private static bool TryGetBookingId(JsonElement element, out Guid bookingId)
    {
        bookingId = Guid.Empty;
        if (TryParseGuidProperty(element, "id", out bookingId) || TryParseGuidProperty(element, "bookingId", out bookingId) || TryParseGuidProperty(element, "BookingId", out bookingId))
            return true;

        return false;
    }

    private static bool IsConfirmedBooking(JsonElement element)
    {
        if (element.TryGetProperty("status", out var statusProp) && statusProp.ValueKind == JsonValueKind.String)
        {
            return string.Equals(statusProp.GetString(), "Confirmed", StringComparison.OrdinalIgnoreCase);
        }

        if (element.TryGetProperty("status", out var statusNumProp) && statusNumProp.ValueKind == JsonValueKind.Number)
        {
            return statusNumProp.GetInt32() == 0;
        }

        return true;
    }

    private static bool TryGetTripId(JsonElement element, out Guid tripId)
    {
        tripId = Guid.Empty;

        if (TryParseGuidProperty(element, "tripId", out tripId) || TryParseGuidProperty(element, "TripId", out tripId))
            return true;

        if (element.TryGetProperty("trip", out var tripEl) && tripEl.ValueKind == JsonValueKind.Object)
        {
            if (TryParseGuidProperty(tripEl, "id", out tripId) || TryParseGuidProperty(tripEl, "tripId", out tripId) || TryParseGuidProperty(tripEl, "TripId", out tripId))
                return true;
        }

        return false;
    }

    private static bool TryParseGuidProperty(JsonElement element, string propertyName, out Guid result)
    {
        result = Guid.Empty;
        if (!element.TryGetProperty(propertyName, out var property))
            return false;

        if (property.ValueKind == JsonValueKind.String && Guid.TryParse(property.GetString(), out result))
            return true;

        return false;
    }
}
