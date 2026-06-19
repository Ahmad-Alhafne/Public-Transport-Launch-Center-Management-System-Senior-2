namespace BookingService.Application.Services;

using System;
using Microsoft.Extensions.Configuration;
using BookingService.Application.DTOs;
using BookingService.Application.Interfaces;
using BookingService.Domain.Entities;
using BookingService.Domain.Enums;

public class BookingManagementService : IBookingService
{
    private readonly IBookingRepository _repository;
    private readonly ITripServiceClient _tripClient;
    private readonly IConfiguration _configuration;

    public BookingManagementService(IBookingRepository repository, ITripServiceClient tripClient, IConfiguration configuration)
    {
        _repository = repository;
        _tripClient = tripClient;
        _configuration = configuration;
    }

    public async Task<IEnumerable<BookingDto>> GetAllBookingsAsync()
    {
        var bookings = await _repository.GetAllAsync();
        return bookings.Select(b => MapToDto(b));
    }

    public async Task<BookingDto> GetBookingByIdAsync(Guid id)
    {
        var booking = await _repository.GetByIdAsync(id);
        if (booking == null)
            throw new Exception($"Booking with ID {id} not found.");

        var tripInfo = await _tripClient.GetTripInfoAsync(booking.TripId, string.Empty);
        return MapToDto(booking, tripInfo);
    }

    public async Task<IEnumerable<BookingDto>> GetBookingsByPassengerIdAsync(Guid passengerId)
    {
        var bookings = await _repository.GetByPassengerIdAsync(passengerId);
        return bookings.Select(b => MapToDto(b));
    }

    public async Task<BookingDto> CreateBookingAsync(CreateBookingDto dto, Guid passengerId, string jwtToken)
    {
        if (dto.SeatCount <= 0)
            throw new Exception("Seat count must be at least 1.");

        // Retrieve trip info to enforce booking rules
        var tripInfo = await _tripClient.GetTripInfoAsync(dto.TripId, jwtToken);
        if (tripInfo == null)
            throw new Exception("Trip not found.");

        // Prevent booking after departure or once trip has started/finished
        var now = DateTime.UtcNow;
        if (tripInfo.DepartureTime <= now)
            throw new Exception("Cannot book a trip that has already started.");

        if (string.Equals(tripInfo.Status, "Started", StringComparison.OrdinalIgnoreCase)
            || string.Equals(tripInfo.Status, "Finished", StringComparison.OrdinalIgnoreCase)
            || string.Equals(tripInfo.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
        {
            throw new Exception("Cannot book a trip that is no longer open for reservations.");
        }

        // Call TripService to decrement available seat
        var seatReserved = await _tripClient.DecrementSeatAsync(dto.TripId, dto.SeatCount, jwtToken);
        if (!seatReserved)
            throw new Exception("No available seats for this trip or trip not found.");

        var booking = new Booking
        {
            TripId = dto.TripId,
            PassengerId = passengerId,
            PassengerName = dto.PassengerName,
            SeatCount = dto.SeatCount,
            Status = BookingStatus.Confirmed,
            TripDepartureTimeUtc = tripInfo.DepartureTime
        };

        await _repository.AddAsync(booking);
        await _repository.SaveChangesAsync();

        // Generate signed QR token for this booking
        try
        {
            var secret = _configuration["QrOptions:Secret"] ?? _configuration["JwtOptions:SecretKey"] ?? "DEFAULT_QR_SECRET_ChangeInProd";
            var payload = $"{booking.Id}|{passengerId}|{booking.TripId}|{booking.BookedAt:o}";
            var payloadBytes = System.Text.Encoding.UTF8.GetBytes(payload);

            using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(secret));
            var sig = hmac.ComputeHash(payloadBytes);

            static string Base64UrlEncode(byte[] input)
            {
                return Convert.ToBase64String(input).TrimEnd('=').Replace('+', '-').Replace('/', '_');
            }

            var token = Base64UrlEncode(payloadBytes) + "." + Base64UrlEncode(sig);
            booking.QrToken = token;
            booking.QrGeneratedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(booking);
            await _repository.SaveChangesAsync();
        }
        catch
        {
            // QR generation failure should not block booking; log in real app
        }

        return MapToDto(booking, tripInfo);
    }

    public async Task<BookingDto> CancelBookingAsync(CancelBookingDto dto, string jwtToken)
    {
        var booking = await _repository.GetByCancellationCodeAsync(dto.CancellationCode);
        if (booking == null)
            throw new Exception("Booking not found with the provided cancellation code.");

        if (booking.Status == BookingStatus.Cancelled)
            throw new Exception("Booking is already cancelled.");

        var tripInfo = await _tripClient.GetTripInfoAsync(booking.TripId, jwtToken);
        if (tripInfo == null)
            throw new Exception("Trip not found for this booking.");

        if (DateTime.UtcNow > tripInfo.DepartureTime.AddMinutes(-30))
            throw new Exception("You can't cancel the reservation now. Too late.");

        if (tripInfo.Status == "Started")
            throw new Exception("You can't cancel the reservation after the trip has started.");

        booking.Status = BookingStatus.Cancelled;
        await _repository.UpdateAsync(booking);
        await _repository.SaveChangesAsync();

        // Call TripService to increment available seat back
        await _tripClient.IncrementSeatAsync(booking.TripId, booking.SeatCount, jwtToken);

        return MapToDto(booking, tripInfo);
    }

    private static BookingDto MapToDto(Booking booking, ITripServiceClient.TripInfo? tripInfo = null)
    {
        return new BookingDto
        {
            Id = booking.Id,
            TripId = booking.TripId,
            PassengerId = booking.PassengerId,
            PassengerName = booking.PassengerName,
            SeatCount = booking.SeatCount,
            CancellationCode = booking.CancellationCode,
            Status = booking.Status,
            TripStatus = tripInfo?.Status ?? "N/A",
            TripDelayMinutes = tripInfo?.DelayMinutes ?? 0,
            TripDepartureTimeUtc = booking.TripDepartureTimeUtc,
            BookedAt = booking.BookedAt,
            QrToken = booking.QrToken
        };
    }

    public async Task<IEnumerable<BookingDto>> GetMyActiveBookingsAsync(Guid passengerId, string jwtToken)
    {
        var bookings = await _repository.GetByPassengerIdAsync(passengerId);
        var now = DateTime.UtcNow;
        var activeBookingDtos = new List<BookingDto>();

        foreach (var booking in bookings)
        {
            if (booking.Status != BookingStatus.Confirmed)
                continue;

            var tripInfo = await _tripClient.GetTripInfoAsync(booking.TripId, jwtToken);
            if (tripInfo == null)
                continue;

            // Active if trip is not finished
            if (!string.Equals(tripInfo.Status, "Finished", StringComparison.OrdinalIgnoreCase))
            {
                activeBookingDtos.Add(MapToDto(booking, tripInfo));
            }
        }

        return activeBookingDtos;
    }

    public async Task<IEnumerable<BookingDto>> GetMyBookingHistoryAsync(Guid passengerId, int daysBack, string jwtToken)
    {
        var bookings = await _repository.GetByPassengerIdAsync(passengerId);
        var now = DateTime.UtcNow;
        var cutoffDate = now.AddDays(-daysBack);
        var historyBookingDtos = new List<BookingDto>();

        foreach (var booking in bookings)
        {
            var tripInfo = await _tripClient.GetTripInfoAsync(booking.TripId, jwtToken);
            if (tripInfo == null)
                continue;

            // History if trip is finished or cancelled
            if (string.Equals(tripInfo.Status, "Finished", StringComparison.OrdinalIgnoreCase) ||
                booking.Status == BookingStatus.Cancelled)
            {
                if (booking.TripDepartureTimeUtc >= cutoffDate)
                {
                    historyBookingDtos.Add(MapToDto(booking, tripInfo));
                }
            }
        }

        return historyBookingDtos.OrderByDescending(b => b.TripDepartureTimeUtc);
    }

    public async Task<IEnumerable<BookingDto>> GetConfirmedBookingsByTripIdAsync(Guid tripId)
    {
        var allBookings = await _repository.GetAllAsync();
        var confirmedBookings = allBookings
            .Where(b => b.TripId == tripId && b.Status == BookingStatus.Confirmed)
            .OrderBy(b => b.BookedAt);
        return confirmedBookings.Select(b => MapToDto(b));
    }
}
