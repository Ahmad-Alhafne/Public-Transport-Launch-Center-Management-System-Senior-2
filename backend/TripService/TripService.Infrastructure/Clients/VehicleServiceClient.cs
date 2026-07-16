namespace TripService.Infrastructure.Clients;

using Microsoft.Extensions.Configuration;
using TripService.Application.Interfaces;
using System.Net.Http;
using System.Text.Json;

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

    private Uri GetVehicleServiceUri(string path)
    {
        var baseUri = new Uri(_vehicleServiceUrl, UriKind.Absolute);
        return new Uri(baseUri, path);
    }

    public async Task<bool> VehicleExistsAsync(Guid vehicleId, string? jwtToken = null)
    {
        var requestUri = GetVehicleServiceUri($"/api/vehicle/{vehicleId}");
        using var request = new HttpRequestMessage(HttpMethod.Get, requestUri);
        if (!string.IsNullOrEmpty(jwtToken))
        {
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);
        }

        var response = await _httpClient.SendAsync(request);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return await CheckVehicleExistsFromListAsync(vehicleId, jwtToken);
        }

        response.EnsureSuccessStatusCode();
        return true;
    }

    private async Task<bool> CheckVehicleExistsFromListAsync(Guid vehicleId, string? jwtToken = null)
    {
        var listUri = GetVehicleServiceUri("/api/vehicle");
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
                if (Guid.TryParse(idElement.GetString(), out var id) && id == vehicleId)
                {
                    return true;
                }
            }
        }

        return false;
    }
}
