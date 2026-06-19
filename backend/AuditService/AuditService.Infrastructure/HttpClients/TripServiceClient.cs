using AuditService.Application.Interfaces;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace AuditService.Infrastructure.HttpClients
{
    public class TripServiceClient : ITripServiceClient
    {
        private readonly HttpClient _client;

        public TripServiceClient(HttpClient client)
        {
            _client = client;
        }

        public async Task<IEnumerable<TripDto>?> GetAllTripsAsync(string? bearerToken = null)
        {
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "/api/trip");
                if (!string.IsNullOrWhiteSpace(bearerToken))
                {
                    // Ensure token has Bearer prefix
                    var value = bearerToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ? bearerToken : $"Bearer {bearerToken}";
                    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", value.Replace("Bearer ", ""));
                }

                var resp = await _client.SendAsync(request);
                if (!resp.IsSuccessStatusCode) return null;

                var result = await resp.Content.ReadFromJsonAsync<IEnumerable<TripDto>>();
                return result;
            }
            catch
            {
                return null;
            }
        }
    }
}
