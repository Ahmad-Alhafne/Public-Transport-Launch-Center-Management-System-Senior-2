namespace TripService.Infrastructure.Clients;

using Microsoft.Extensions.Configuration;
using TripService.Application.Interfaces;
using System.Net.Http;
using System.Net.Http.Json;

public class AuthServiceClient : IAuthServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly string _authServiceUrl;

    public AuthServiceClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _authServiceUrl = configuration["AuthServiceUrl"]
            ?? configuration["ServiceUrls:AuthServiceUrl"]
            ?? "http://localhost:5104"; // Local development AuthService port
    }
    private Uri BuildRequestUri(string relativePath)
    {
        var baseUrl = _authServiceUrl.TrimEnd('/');
        var path = relativePath.TrimStart('/');
        return new Uri($"{baseUrl}/{path}", UriKind.Absolute);
    }

    public async Task UpdateUserPhoneAsync(Guid userId, string phoneNumber, string? jwtToken = null)
    {
        using var request = new HttpRequestMessage(HttpMethod.Patch, BuildRequestUri($"api/users/{userId}/phone"))
        {
            Content = JsonContent.Create(new { phoneNumber })
        };
        if (!string.IsNullOrEmpty(jwtToken))
        {
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);
        }
        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    public async Task UpdateUserPasswordAsync(Guid userId, string newPassword, string? jwtToken = null)
    {
        using var request = new HttpRequestMessage(HttpMethod.Patch, BuildRequestUri($"api/users/{userId}/password"))
        {
            Content = JsonContent.Create(new { newPassword })
        };
        if (!string.IsNullOrEmpty(jwtToken))
        {
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);
        }
        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    public async Task<bool> UserExistsAsync(Guid userId, string? jwtToken = null)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, BuildRequestUri($"api/users/{userId}"));
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
