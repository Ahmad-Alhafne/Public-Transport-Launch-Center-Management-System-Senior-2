namespace BookingService.Infrastructure.HttpClients;

using System.Net.Http.Headers;
using System.Net.Http.Json;
using BookingService.Application.Interfaces;
using Microsoft.Extensions.Configuration;

public class TripServiceClient : ITripServiceClient
{
    private readonly HttpClient _httpClient;

    public TripServiceClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        var tripServiceUrl = configuration["ServiceUrls:TripService"]!;
        _httpClient.BaseAddress = new Uri(tripServiceUrl.TrimEnd('/') + "/");
        _httpClient.DefaultRequestHeaders.CacheControl = new CacheControlHeaderValue { NoCache = true };
    }

    public async Task<bool> DecrementSeatAsync(Guid tripId, int count, string jwtToken)
    {
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);
        var response = await _httpClient.PostAsJsonAsync($"api/trip/{tripId}/decrement-seat", new { count });
        return response.IsSuccessStatusCode;
    }

    public async Task<bool> IncrementSeatAsync(Guid tripId, int count, string jwtToken)
    {
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);
        var response = await _httpClient.PostAsJsonAsync($"api/trip/{tripId}/increment-seat", new { count });
        return response.IsSuccessStatusCode;
    }

    public async Task<DateTime?> GetTripDepartureTimeUtcAsync(Guid tripId, string jwtToken)
    {
        var info = await GetTripInfoAsync(tripId, jwtToken);
        return info?.DepartureTime;
    }

    public async Task<ITripServiceClient.TripInfo?> GetTripInfoAsync(Guid tripId, string jwtToken)
    {
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);
        var response = await _httpClient.GetAsync($"api/trip/{tripId}");
        if (!response.IsSuccessStatusCode)
            return null;

        var trip = await response.Content.ReadFromJsonAsync<TripInfoDto>();
        return trip == null
            ? null
            : new ITripServiceClient.TripInfo
            {
                DepartureTime = trip.DepartureTime,
                Status = trip.Status,
                DelayMinutes = trip.DelayMinutes,
                AvailableSeats = trip.AvailableSeats
            };
    }

    private sealed class TripInfoDto
    {
        public DateTime DepartureTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? DelayMinutes { get; set; }
        public int AvailableSeats { get; set; }
    }
}
