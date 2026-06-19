using AuditService.Application.Interfaces;
using System.Net.Http.Json;
using System;
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
    }
}
