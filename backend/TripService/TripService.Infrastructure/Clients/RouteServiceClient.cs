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
            ?? "http://localhost:5006";
    }

    public async Task<bool> RouteExistsAsync(Guid routeId, string? jwtToken = null)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"{_routeServiceUrl}/api/route/{routeId}");
        if (!string.IsNullOrEmpty(jwtToken))
        {
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);
        }
        var response = await _httpClient.SendAsync(request);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return false;

        response.EnsureSuccessStatusCode();
        return true;
    }
}