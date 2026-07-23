using AuditService.Application.Interfaces;
using System.Net.Http.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuditService.Infrastructure.HttpClients
{
    public class BookingServiceClient : IBookingServiceClient
    {
        private readonly HttpClient _http;

        public BookingServiceClient(HttpClient http)
        {
            _http = http;
        }

        public async Task<BookingSummary?> GetBookingAsync(Guid bookingId)
        {
            try
            {
                var resp = await _http.GetAsync($"/api/booking/{bookingId}");
                if (!resp.IsSuccessStatusCode) return null;
                var body = await resp.Content.ReadFromJsonAsync<BookingSummary?>();
                return body;
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<BookingSummary>?> GetBookingsByTripIdAsync(Guid tripId, string? bearerToken = null)
        {
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, $"/api/booking/trip/{tripId}");
                if (!string.IsNullOrWhiteSpace(bearerToken))
                {
                    var value = bearerToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ? bearerToken : $"Bearer {bearerToken}";
                    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", value.Replace("Bearer ", ""));
                }

                var resp = await _http.SendAsync(request);
                if (!resp.IsSuccessStatusCode) return null;
                var body = await resp.Content.ReadFromJsonAsync<IEnumerable<BookingSummary>?>();
                return body;
            }
            catch
            {
                return null;
            }
        }
    }
}
