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
            ?? "http://localhost:5001";
    }

    public async Task UpdateUserPhoneAsync(Guid userId, string phoneNumber, string? jwtToken = null)
    {
        using var request = new HttpRequestMessage(HttpMethod.Patch, $"{_authServiceUrl}/api/users/{userId}/phone")
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
        using var request = new HttpRequestMessage(HttpMethod.Patch, $"{_authServiceUrl}/api/users/{userId}/password")
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
        using var request = new HttpRequestMessage(HttpMethod.Get, $"{_authServiceUrl}/api/users/{userId}");
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
