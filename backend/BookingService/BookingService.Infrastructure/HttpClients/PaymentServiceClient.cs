namespace BookingService.Infrastructure.HttpClients;

using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using BookingService.Application.DTOs;

public class PaymentServiceClient : BookingService.Application.Interfaces.IPaymentServiceClient
{
    private readonly HttpClient _httpClient;

    public PaymentServiceClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        var url = configuration["ServiceUrls:PaymentService"];
        if (string.IsNullOrWhiteSpace(url))
            throw new InvalidOperationException("PaymentService URL is not configured. Ensure 'ServiceUrls:PaymentService' is set in appsettings.json");
        
        _httpClient.BaseAddress = new Uri(url.TrimEnd('/') + "/");
        _httpClient.DefaultRequestHeaders.CacheControl = new System.Net.Http.Headers.CacheControlHeaderValue { NoCache = true };
    }

    public async Task<bool> RefundAsync(Guid bookingId, decimal amount, string jwtToken, string currency = "usd")
    {
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);
        var body = new { BookingId = bookingId, Amount = amount, Currency = currency };
        var response = await _httpClient.PostAsJsonAsync("api/payments/refund", body);
        return response.IsSuccessStatusCode;
    }

    public async Task<PaymentInfoDto?> GetPaymentByBookingIdAsync(Guid bookingId, string jwtToken)
    {
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);
        var response = await _httpClient.GetAsync($"api/payments/booking/{bookingId}");
        if (!response.IsSuccessStatusCode)
            return null;
        var dto = await response.Content.ReadFromJsonAsync<PaymentInfoDto>();
        return dto;
    }
}
