using System.Net.Http.Json;

namespace NotificationService.Api.Clients;

public class AuthServiceClient : IAuthServiceClient
{
    private readonly HttpClient _httpClient;

    public AuthServiceClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string?> GetUserLanguagePreferenceAsync(Guid userId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/Users/{userId}");
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var user = await response.Content.ReadFromJsonAsync<UserSummaryResponse?>();
            return user?.LanguagePreference;
        }
        catch
        {
            return null;
        }
    }

    private sealed class UserSummaryResponse
    {
        public string? LanguagePreference { get; set; }
    }
}
