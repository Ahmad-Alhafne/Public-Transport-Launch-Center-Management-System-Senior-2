namespace AuthService.Infrastructure.HttpClients;

using System.Net.Http.Headers;
using System.Net.Http.Json;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Http;

public class TripServiceClient : ITripServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TripServiceClient(HttpClient httpClient, IHttpContextAccessor httpContextAccessor)
    {
        _httpClient = httpClient;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task CreateDriverProfileAsync(CreateDriverProfileRequest dto)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "api/driver/profile")
        {
            Content = JsonContent.Create(dto)
        };

        AttachAuthorizationHeader(request);

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    public async Task UpdateDriverProfileAsync(Guid driverId, UpdateDriverProfileRequest dto)
    {
        using var request = new HttpRequestMessage(HttpMethod.Put, $"api/driver/profile/{driverId}")
        {
            Content = JsonContent.Create(dto)
        };

        AttachAuthorizationHeader(request);

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    private void AttachAuthorizationHeader(HttpRequestMessage request)
    {
        var bearerToken = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(bearerToken) && bearerToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            request.Headers.Authorization = AuthenticationHeaderValue.Parse(bearerToken);
        }
    }
}
