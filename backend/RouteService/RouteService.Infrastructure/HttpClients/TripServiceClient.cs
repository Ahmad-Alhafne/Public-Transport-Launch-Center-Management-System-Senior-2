namespace RouteService.Infrastructure.HttpClients;

using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using RouteService.Application.Interfaces;

public class TripServiceClient : ITripServiceClient
{
    private readonly HttpClient _httpClient;

    public TripServiceClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri(configuration["ServiceUrls:TripService"]!);
    }

    public async Task<bool> TripsExistForRouteAsync(Guid routeId, string jwtToken)
    {
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);
        var response = await _httpClient.GetAsync($"api/trip/route/{routeId}/exists");
        if (!response.IsSuccessStatusCode)
            throw new Exception("Failed to validate whether route has associated trips.");

        var payload = await response.Content.ReadFromJsonAsync<ExistsResponse>();
        return payload?.Exists ?? false;
    }

    private sealed class ExistsResponse
    {
        public bool Exists { get; set; }
    }
}

