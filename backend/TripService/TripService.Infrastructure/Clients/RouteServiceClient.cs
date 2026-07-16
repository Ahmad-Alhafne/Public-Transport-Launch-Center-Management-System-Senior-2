namespace TripService.Infrastructure.Clients;

using Microsoft.Extensions.Configuration;
using TripService.Application.Interfaces;
using System.Net.Http;

public class RouteServiceClient : IRouteServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly string _routeServiceUrl;

    public RouteServiceClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _routeServiceUrl = configuration["RouteServiceUrl"]
            ?? configuration["ServiceUrls:RouteServiceUrl"]
            ?? "http://localhost:5043"; // Local development RouteService port
    }

    private Uri GetRouteServiceUri(string path)
    {
        var baseUri = new Uri(_routeServiceUrl, UriKind.Absolute);
        return new Uri(baseUri, path);
    }

    public async Task<bool> RouteExistsAsync(Guid routeId, string? jwtToken = null)
    {
        var requestUri = GetRouteServiceUri($"/api/route/{routeId}");
        using var request = new HttpRequestMessage(HttpMethod.Get, requestUri);
        if (!string.IsNullOrEmpty(jwtToken))
        {
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);
        }
        var response = await _httpClient.SendAsync(request);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            // Fallback: if route-by-id is not available, try the route list and search locally.
            return await CheckRouteExistsFromListAsync(routeId, jwtToken);
        }

        response.EnsureSuccessStatusCode();
        return true;
    }

    private async Task<bool> CheckRouteExistsFromListAsync(Guid routeId, string? jwtToken)
    {
        var listUri = GetRouteServiceUri("/api/route");
        using var request = new HttpRequestMessage(HttpMethod.Get, listUri);
        if (!string.IsNullOrEmpty(jwtToken))
        {
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);
        }

        using var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            return false;
        }

        using var stream = await response.Content.ReadAsStreamAsync();
        using var document = await System.Text.Json.JsonDocument.ParseAsync(stream);
        if (document.RootElement.ValueKind != System.Text.Json.JsonValueKind.Array)
        {
            return false;
        }

        foreach (var element in document.RootElement.EnumerateArray())
        {
            if (element.TryGetProperty("id", out var idElement) && idElement.ValueKind == System.Text.Json.JsonValueKind.String)
            {
                if (Guid.TryParse(idElement.GetString(), out var id) && id == routeId)
                {
                    return true;
                }
            }
        }

        return false;
    }
}