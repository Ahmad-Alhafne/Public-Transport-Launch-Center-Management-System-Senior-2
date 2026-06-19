using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using OrganizerService.Application.Interfaces;

namespace OrganizerService.Infrastructure.HttpClients
{
    public class TripServiceClient : OrganizerService.Application.Interfaces.ITripServiceClient
    {
        private readonly HttpClient _client;

        public TripServiceClient(HttpClient client)
        {
            _client = client;
        }

        public async Task<IEnumerable<dynamic>> GetTripsByDateAsync(DateTime date)
        {
            // Expect trip service to expose /trip?date=YYYY-MM-DD
            var url = $"/trip?date={date:yyyy-MM-dd}";
            try
            {
                var res = await _client.GetFromJsonAsync<IEnumerable<dynamic>>(url);
                return res ?? Array.Empty<dynamic>();
            }
            catch
            {
                return Array.Empty<dynamic>();
            }
        }
    }
}
