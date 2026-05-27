using ApiGateway.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ApiGateway.Controllers;

[ApiController]
[Route("api/admin/trips")]
[Authorize(Roles = "Admin")]
public class AdminTripDetailsController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AdminTripDetailsController> _logger;

    public AdminTripDetailsController(HttpClient httpClient, IConfiguration configuration, ILogger<AdminTripDetailsController> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpGet("{id:guid}/details")]
    public async Task<IActionResult> GetTripDetails(Guid id)
    {
        try
        {
            // Prepare authorization header from request
            var authHeader = Request.Headers["Authorization"].ToString();
            if (!string.IsNullOrEmpty(authHeader))
            {
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(
                    authHeader.Replace("Bearer ", "").Length > 0 ? "Bearer" : "",
                    authHeader.Replace("Bearer ", "")
                );
            }

            var tripServiceUrl = _configuration["Services:TripService"] ?? "http://localhost:5003";
            var routeServiceUrl = _configuration["Services:RouteService"] ?? "http://localhost:5002";
            var bookingServiceUrl = _configuration["Services:BookingService"] ?? "http://localhost:5004";
            var authServiceUrl = _configuration["Services:AuthService"] ?? "http://localhost:5001";

            // 1. Get trip details from TripService
            var tripResponse = await _httpClient.GetAsync($"{tripServiceUrl}/api/trip/{id}");
            if (!tripResponse.IsSuccessStatusCode)
                return NotFound(new { message = "Trip not found" });

            var tripContent = await tripResponse.Content.ReadAsStringAsync();
            var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var tripData = JsonSerializer.Deserialize<TripResponseDto>(tripContent, jsonOptions);

            if (tripData == null)
                return NotFound(new { message = "Trip not found" });

            var routeId = tripData.RouteId;
            var driverId = tripData.DriverId;
            var totalSeats = tripData.TotalSeats;

            // 2. Get route details from RouteService
            var routeResponse = await _httpClient.GetAsync($"{routeServiceUrl}/api/route/{routeId}");
            string routeSource = "N/A", routeDestination = "N/A";
            if (routeResponse.IsSuccessStatusCode)
            {
                var routeContent = await routeResponse.Content.ReadAsStringAsync();
                using var routeDoc = JsonDocument.Parse(routeContent);
                routeSource = GetStringProperty(routeDoc.RootElement, "source") ?? "";
                routeDestination = GetStringProperty(routeDoc.RootElement, "destination") ?? "";
            }

            // 3. Get bookings from BookingService
            var bookingsResponse = await _httpClient.GetAsync($"{bookingServiceUrl}/api/booking/trip/{id}");
            var passengers = new List<PassengerDto>();
            int totalReservedSeats = 0;

            if (bookingsResponse.IsSuccessStatusCode)
            {
                var bookingsContent = await bookingsResponse.Content.ReadAsStringAsync();
                using var bookingsDoc = JsonDocument.Parse(bookingsContent);
                var bookingsArray = bookingsDoc.RootElement;

                var passengerIds = new List<Guid>();

                if (bookingsArray.ValueKind == JsonValueKind.Array)
                {
                    foreach (var booking in bookingsArray.EnumerateArray())
                    {
                        var passengerId = GetGuidProperty(booking, "passengerId");
                        var seatCount = GetIntProperty(booking, "seatCount");

                        passengerIds.Add(passengerId);
                        totalReservedSeats += seatCount;

                        passengers.Add(new PassengerDto
                        {
                            PassengerId = passengerId,
                            PassengerName = GetStringProperty(booking, "passengerName") ?? string.Empty,
                            SeatCount = seatCount,
                            BookedAt = GetDateTimeProperty(booking, "bookedAt") ?? DateTime.MinValue,
                            Status = GetIntProperty(booking, "status")
                        });
                    }
                }

                // 4. Get user info for passengers and driver
                var driverName = "Unknown";
                string? driverPhone = null;

                if (passengerIds.Count > 0 || driverId != Guid.Empty)
                {
                    var userIds = passengerIds.Where(id => id != Guid.Empty).ToList();
                    if (driverId != Guid.Empty) userIds.Add(driverId);

                    if (userIds.Count > 0)
                    {
                        // Send request to AuthService to fetch user names/phones for passengers + driver.
                        // Use PascalCase to match the DTO property name exactly.
                        var usersResponse = await _httpClient.PostAsJsonAsync(
                            $"{authServiceUrl}/api/users/by-ids",
                            new { UserIds = userIds }
                        );

                        if (usersResponse.IsSuccessStatusCode)
                        {
                            var usersContent = await usersResponse.Content.ReadAsStringAsync();
                            using var usersDoc = JsonDocument.Parse(usersContent);
                            var usersArray = usersDoc.RootElement;

                            if (usersArray.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var user in usersArray.EnumerateArray())
                                {
                                    var userId = GetGuidProperty(user, "id");
                                    var phone = GetStringProperty(user, "phoneNumber");

                                    // Update passenger phone
                                    var passenger = passengers.FirstOrDefault(p => p.PassengerId == userId);
                                    if (passenger != null)
                                    {
                                        passenger.PassengerPhone = phone;
                                    }

                                    // Set driver info
                                    if (userId == driverId)
                                    {
                                        driverName = GetStringProperty(user, "fullName") ?? GetStringProperty(user, "name") ?? driverName;
                                        driverPhone = phone;
                                    }
                                }
                            }
                        }
                    }
                }

                // 5. Construct composite DTO
                var seatUsage = new SeatUsageSummaryDto
                {
                    TotalSeats = totalSeats,
                    ReservedSeats = totalReservedSeats,
                    AvailableSeats = Math.Max(0, totalSeats - totalReservedSeats),
                    OccupancyPercentage = totalSeats > 0 ? (totalReservedSeats / (double)totalSeats) * 100 : 0
                };

                var statusValue = 0;
                if (!string.IsNullOrWhiteSpace(tripData.Status) && Enum.TryParse<TripStatus>(tripData.Status, true, out var parsedStatus))
                {
                    statusValue = (int)parsedStatus;
                }

                var tripDetails = new TripDetailsDto
                {
                    Id = id,
                    RouteId = routeId,
                    StartLocation = routeSource,
                    EndLocation = routeDestination,
                    DriverId = driverId,
                    DriverName = driverName,
                    DriverPhone = driverPhone,
                    BusNumber = tripData.BusNumber ?? string.Empty,
                    DepartureTime = tripData.DepartureTime,
                    ArrivalTime = tripData.ArrivalTime,
                    TotalSeats = totalSeats,
                    Status = statusValue,
                    Passengers = passengers,
                    SeatUsage = seatUsage
                };

                return Ok(tripDetails);
            }

            // If bookings call failed, still return basic trip info
            var fallbackSeatUsage = new SeatUsageSummaryDto
            {
                TotalSeats = totalSeats,
                ReservedSeats = 0,
                AvailableSeats = totalSeats,
                OccupancyPercentage = 0
            };

            var fallbackStatusValue = 0;
            if (!string.IsNullOrWhiteSpace(tripData.Status) && Enum.TryParse<TripStatus>(tripData.Status, true, out var fallbackParsedStatus))
            {
                fallbackStatusValue = (int)fallbackParsedStatus;
            }

            var fallbackTripDetails = new TripDetailsDto
            {
                Id = id,
                RouteId = routeId,
                    StartLocation = routeSource,
                    EndLocation = routeDestination,
                DepartureTime = tripData.DepartureTime,
                ArrivalTime = tripData.ArrivalTime,
                TotalSeats = totalSeats,
                Status = fallbackStatusValue,
                Passengers = new List<PassengerDto>(),
                SeatUsage = fallbackSeatUsage
            };

            return Ok(fallbackTripDetails);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching trip details for {TripId}", id);
            return StatusCode(500, new { message = "Error fetching trip details", error = ex.Message });
        }
    }

    private static bool TryGetPropertyCaseInsensitive(JsonElement element, string propertyName, out JsonElement value)
    {
        if (element.TryGetProperty(propertyName, out value))
        {
            return true;
        }

        foreach (var property in element.EnumerateObject())
        {
            if (string.Equals(property.Name, propertyName, StringComparison.OrdinalIgnoreCase))
            {
                value = property.Value;
                return true;
            }
        }

        value = default;
        return false;
    }

    private static Guid GetGuidProperty(JsonElement element, string propertyName)
    {
        if (TryGetPropertyCaseInsensitive(element, propertyName, out var property)
            && property.ValueKind == JsonValueKind.String
            && Guid.TryParse(property.GetString(), out var value))
        {
            return value;
        }

        return Guid.Empty;
    }

    private static int GetIntProperty(JsonElement element, string propertyName)
    {
        if (TryGetPropertyCaseInsensitive(element, propertyName, out var property)
            && property.ValueKind == JsonValueKind.Number
            && property.TryGetInt32(out var value))
        {
            return value;
        }

        // Sometimes values are returned as strings
        if (TryGetPropertyCaseInsensitive(element, propertyName, out property)
            && property.ValueKind == JsonValueKind.String
            && int.TryParse(property.GetString(), out var stringValue))
        {
            return stringValue;
        }

        return 0;
    }

    private static DateTime? GetDateTimeProperty(JsonElement element, string propertyName)
    {
        if (TryGetPropertyCaseInsensitive(element, propertyName, out var property)
            && property.ValueKind == JsonValueKind.String
            && DateTime.TryParse(property.GetString(), out var value))
        {
            return value;
        }

        return null;
    }

    private static string? GetStringProperty(JsonElement element, string propertyName)
    {
        if (TryGetPropertyCaseInsensitive(element, propertyName, out var property) && property.ValueKind != JsonValueKind.Null)
        {
            return property.GetString();
        }

        return null;
    }

    private record TripResponseDto
    {
        public Guid Id { get; init; }
        public Guid RouteId { get; init; }
        public Guid DriverId { get; init; }
        public string? BusNumber { get; init; }
        public DateTime DepartureTime { get; init; }
        public DateTime? ArrivalTime { get; init; }
        public int TotalSeats { get; init; }
        public string? Status { get; init; }
    }

    private record TripDetailsDto
    {
        public Guid Id { get; init; }
        public Guid RouteId { get; init; }
        public string? StartLocation { get; init; }
        public string? EndLocation { get; init; }
        public Guid DriverId { get; init; }
        public string? DriverName { get; init; }
        public string? DriverPhone { get; init; }
        public string BusNumber { get; init; } = string.Empty;
        public DateTime DepartureTime { get; init; }
        public DateTime? ArrivalTime { get; init; }
        public int TotalSeats { get; init; }
        public int Status { get; init; }
        public List<PassengerDto> Passengers { get; init; } = new List<PassengerDto>();
        public SeatUsageSummaryDto SeatUsage { get; init; } = new SeatUsageSummaryDto();
    }

    private record SeatUsageSummaryDto
    {
        public int TotalSeats { get; init; }
        public int ReservedSeats { get; init; }
        public int AvailableSeats { get; init; }
        public double OccupancyPercentage { get; init; }
    }

    private record PassengerDto
    {
        public Guid PassengerId { get; init; }
        public string PassengerName { get; init; } = string.Empty;
        public string? PassengerPhone { get; set; }
        public int SeatCount { get; init; }
        public DateTime BookedAt { get; init; }
        public int Status { get; init; }
    }

    private enum TripStatus
    {
        Scheduled,
        Started,
        Delayed,
        Finished,
        Cancelled
    }
}
