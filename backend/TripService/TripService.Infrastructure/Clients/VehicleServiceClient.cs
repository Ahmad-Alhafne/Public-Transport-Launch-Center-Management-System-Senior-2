namespace TripService.Infrastructure.Clients;

using Microsoft.Extensions.Configuration;
using TripService.Application.Interfaces;
using System.Net.Http;

public class VehicleServiceClient : IVehicleServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly string _vehicleServiceUrl;

    public VehicleServiceClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _vehicleServiceUrl = configuration["VehicleServiceUrl"]
            ?? configuration["ServiceUrls:VehicleServiceUrl"]
            ?? "http://localhost:5007";
    }

    public async Task<bool> VehicleExistsAsync(Guid vehicleId, string? jwtToken = null)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"{_vehicleServiceUrl}/api/vehicle/{vehicleId}");
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
