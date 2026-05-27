namespace TripService.Application.Services;

using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using TripService.Application.DTOs;
using TripService.Application.Interfaces;
using TripService.Domain.Entities;
using TripService.Domain.Enums;

public class TripManagementService : ITripService
{
    private readonly ITripRepository _repository;
    private readonly IVehicleServiceClient _vehicleServiceClient;
    private readonly IRouteServiceClient _routeServiceClient;
    private readonly IAuthServiceClient _authServiceClient;
    private readonly string _notificationServiceUrl;

    public TripManagementService(ITripRepository repository, IVehicleServiceClient vehicleServiceClient, IRouteServiceClient routeServiceClient, IAuthServiceClient authServiceClient, string notificationServiceUrl)
    {
        _repository = repository;
        _vehicleServiceClient = vehicleServiceClient;
        _routeServiceClient = routeServiceClient;
        _authServiceClient = authServiceClient;
        _notificationServiceUrl = notificationServiceUrl;
    }

    public async Task<IEnumerable<TripDto>> GetAllTripsAsync()
    {
        var trips = (await _repository.GetAllAsync()).ToList();
        foreach (var trip in trips)
        {
            await NormalizeTripStatusAsync(trip);
        }
        return trips.Select(MapToDto);
    }

    public async Task<TripDto> GetTripByIdAsync(Guid id)
    {
        var trip = await _repository.GetByIdAsync(id);
        if (trip == null)
            throw new Exception($"Trip with ID {id} not found.");

        await NormalizeTripStatusAsync(trip);
        return MapToDto(trip);
    }

    public async Task<IEnumerable<TripDto>> GetTripsByDriverIdAsync(Guid driverId)
    {
        var trips = (await _repository.GetByDriverIdAsync(driverId)).ToList();
        foreach (var trip in trips)
        {
            await NormalizeTripStatusAsync(trip);
        }
        return trips.Select(MapToDto);
    }

    public async Task<IEnumerable<TripDto>> GetTripsByRouteIdAsync(Guid routeId)
    {
        var trips = (await _repository.GetByRouteIdAsync(routeId)).OrderByDescending(t => t.DepartureTime).ToList();
        foreach (var trip in trips)
        {
            await NormalizeTripStatusAsync(trip);
        }
        return trips.Select(MapToDto);
    }

    public async Task<IEnumerable<TripDto>> GetActiveTripsAsync()
    {
        // Active trips: Status is Scheduled, Started, or Delayed
        var trips = (await _repository.GetAllAsync()).ToList();
        foreach (var trip in trips)
        {
            await NormalizeTripStatusAsync(trip);
        }

        var activeTrips = trips
            .Where(t => t.Status == TripStatus.Scheduled || t.Status == TripStatus.Started || t.Status == TripStatus.Delayed)
            .OrderBy(t => t.DepartureTime);
        return activeTrips.Select(MapToDto);
    }

    public async Task<IEnumerable<TripDto>> GetTripHistoryAsync(int daysBack = 7)
    {
        // History: finished or cancelled trips from the last X days
        var trips = (await _repository.GetAllAsync()).ToList();
        foreach (var trip in trips)
        {
            await NormalizeTripStatusAsync(trip);
        }

        var cutoffDate = DateTime.UtcNow.AddDays(-daysBack);
        var historyTrips = trips
            .Where(t => (t.Status == TripStatus.Finished || t.Status == TripStatus.Cancelled) &&
                        t.DepartureTime >= cutoffDate)
            .OrderByDescending(t => t.DepartureTime);
        return historyTrips.Select(MapToDto);
    }

    public async Task<IEnumerable<TripDto>> GetDriverTripHistoryAsync(Guid driverId, int daysBack = 7)
    {
        // Driver's finished or cancelled trips from the last X days
        var trips = (await _repository.GetByDriverIdAsync(driverId)).ToList();
        foreach (var trip in trips)
        {
            await NormalizeTripStatusAsync(trip);
        }

        var cutoffDate = DateTime.UtcNow.AddDays(-daysBack);
        var historyTrips = trips
            .Where(t => (t.Status == TripStatus.Finished || t.Status == TripStatus.Cancelled) &&
                        t.DepartureTime >= cutoffDate)
            .OrderByDescending(t => t.DepartureTime);
        return historyTrips.Select(MapToDto);
    }

    public async Task<bool> TripsExistForRouteAsync(Guid routeId)
    {
        return await _repository.ExistsByRouteIdAsync(routeId);
    }

    public async Task<TripDto> CreateTripAsync(CreateTripDto dto, string? jwtToken = null)
    {
        if (dto.RouteId == Guid.Empty)
            throw new ArgumentException("RouteId is required.", nameof(dto.RouteId));

        var routeExists = await _routeServiceClient.RouteExistsAsync(dto.RouteId, jwtToken);
        if (!routeExists)
            throw new KeyNotFoundException($"Route with ID {dto.RouteId} not found.");

        if (dto.DriverId == Guid.Empty)
            throw new ArgumentException("DriverId is required.", nameof(dto.DriverId));

        var driverExists = await _authServiceClient.UserExistsAsync(dto.DriverId, jwtToken);
        if (!driverExists)
            throw new KeyNotFoundException($"Driver with ID {dto.DriverId} not found.");

        if (dto.VehicleId == Guid.Empty)
            throw new ArgumentException("VehicleId is required.", nameof(dto.VehicleId));

        var vehicleExists = await _vehicleServiceClient.VehicleExistsAsync(dto.VehicleId, jwtToken);
        if (!vehicleExists)
            throw new KeyNotFoundException($"Vehicle with ID {dto.VehicleId} not found.");

        var trip = new Trip
        {
            RouteId = dto.RouteId,
            DriverId = dto.DriverId,
            VehicleId = dto.VehicleId,
            BusNumber = dto.BusNumber,
            DepartureTime = dto.DepartureTime,
            ArrivalTime = dto.ArrivalTime,
            TotalSeats = dto.TotalSeats,
            AvailableSeats = dto.TotalSeats,
            Status = TripStatus.Scheduled
        };

        await _repository.AddAsync(trip);
        await _repository.SaveChangesAsync();
        return MapToDto(trip);
    }

    public async Task<TripDto> UpdateTripAsync(Guid id, UpdateTripDto dto, string? jwtToken = null)
    {
        var trip = await _repository.GetByIdAsync(id);
        if (trip == null)
            throw new Exception($"Trip with ID {id} not found.");

        var bookedSeats = trip.TotalSeats - trip.AvailableSeats;
        if (bookedSeats < 0) bookedSeats = 0;
        if (dto.TotalSeats < bookedSeats)
            throw new Exception("Total seats cannot be less than already booked seats.");

        if (dto.VehicleId == Guid.Empty)
            throw new ArgumentException("VehicleId is required.", nameof(dto.VehicleId));

        var vehicleExists = await _vehicleServiceClient.VehicleExistsAsync(dto.VehicleId, jwtToken);
        if (!vehicleExists)
            throw new KeyNotFoundException($"Vehicle with ID {dto.VehicleId} not found.");

        trip.RouteId = dto.RouteId;
        trip.DriverId = dto.DriverId;
        trip.VehicleId = dto.VehicleId;
        trip.BusNumber = dto.BusNumber;
        trip.DepartureTime = dto.DepartureTime;
        trip.ArrivalTime = dto.ArrivalTime;
        trip.TotalSeats = dto.TotalSeats;
        trip.AvailableSeats = dto.TotalSeats - bookedSeats;

        await _repository.UpdateAsync(trip);
        await _repository.SaveChangesAsync();
        return MapToDto(trip);
    }

    public async Task<TripDto> UpdateTripStatusAsync(Guid id, UpdateTripStatusDto dto, string? jwtToken = null)
    {
        var trip = await _repository.GetByIdAsync(id);
        if (trip == null)
            throw new Exception($"Trip with ID {id} not found.");

        var previousStatus = trip.Status;

        // Apply status changes
        switch (dto.Status)
        {
            case TripStatus.Delayed:
                if (dto.DelayMinutes == null || dto.DelayMinutes <= 0)
                    throw new Exception("Delay duration must be provided and greater than zero.");

                trip.Status = TripStatus.Delayed;
                trip.DelayMinutes = dto.DelayMinutes;
                trip.DelayReason = dto.DelayReason;
                trip.AdminContact = dto.AdminContact;
                trip.DepartureTime = trip.DepartureTime.AddMinutes(dto.DelayMinutes.Value);
                break;
            case TripStatus.Started:
                trip.Status = TripStatus.Started;
                break;
            case TripStatus.Finished:
                trip.Status = TripStatus.Finished;
                break;
            case TripStatus.Cancelled:
                trip.Status = TripStatus.Cancelled;
                break;
            case TripStatus.Scheduled:
                trip.Status = TripStatus.Scheduled;
                break;
            default:
                trip.Status = dto.Status;
                break;
        }

        await _repository.UpdateAsync(trip);
        await _repository.SaveChangesAsync();

        await NotifyAdminsAsync(trip, previousStatus, trip.Status, jwtToken);

        return MapToDto(trip);
    }

    public async Task DeleteTripAsync(Guid id)
    {
        var trip = await _repository.GetByIdAsync(id);
        if (trip == null)
            throw new Exception($"Trip with ID {id} not found.");

        if (trip.AvailableSeats < trip.TotalSeats)
            throw new Exception("Cannot delete trip with existing bookings.");

        await _repository.DeleteAsync(trip);
        await _repository.SaveChangesAsync();
    }

    public async Task<bool> DecrementSeatAsync(Guid tripId)
    {
        return await DecrementSeatsAsync(tripId, 1);
    }

    public async Task<bool> IncrementSeatAsync(Guid tripId)
    {
        return await IncrementSeatsAsync(tripId, 1);
    }

    public async Task<bool> DecrementSeatsAsync(Guid tripId, int count)
    {
        if (count <= 0)
            throw new Exception("Seat count must be at least 1.");

        var trip = await _repository.GetByIdAsync(tripId);
        if (trip == null)
            return false;

        // Prevent seat reservations after the trip has started
        if (trip.DepartureTime <= DateTime.UtcNow || trip.Status == TripStatus.Started || trip.Status == TripStatus.Finished || trip.Status == TripStatus.Cancelled)
            return false;

        return await _repository.TryDecrementSeatsAsync(tripId, count);
    }

    public async Task<bool> IncrementSeatsAsync(Guid tripId, int count)
    {
        if (count <= 0)
            throw new Exception("Seat count must be at least 1.");

        return await _repository.TryIncrementSeatsAsync(tripId, count);
    }

    private async Task NormalizeTripStatusAsync(Trip trip)
    {
        var nowUtc = DateTime.UtcNow;
        var originalStatus = trip.Status;

        // Ensure we treat user-provided local times as local when comparing against UTC.
        DateTime NormalizeDateTime(DateTime dt)
        {
            if (dt == DateTime.MinValue || dt == DateTime.MaxValue)
                return dt;

            // Stored values from EF/SQL are often 'Unspecified' kind; treat them as UTC to avoid double-shifting.
            if (dt.Kind == DateTimeKind.Utc || dt.Kind == DateTimeKind.Unspecified)
                return DateTime.SpecifyKind(dt, DateTimeKind.Utc);

            // Treat explicit local times as local.
            var local = DateTime.SpecifyKind(dt, DateTimeKind.Local);
            return local.ToUniversalTime();
        }

        var departureUtc = NormalizeDateTime(trip.DepartureTime);
        var arrivalUtc = trip.ArrivalTime.HasValue ? NormalizeDateTime(trip.ArrivalTime.Value) : (DateTime?)null;

        // If trip is scheduled but departure time has passed, mark as started
        if (trip.Status == TripStatus.Scheduled && departureUtc != DateTime.MinValue && nowUtc >= departureUtc)
        {
            trip.Status = TripStatus.Started;
        }

        // If trip has started or is delayed and has an arrival time in the past, mark as finished
        if ((trip.Status == TripStatus.Started || trip.Status == TripStatus.Delayed)
            && arrivalUtc.HasValue
            && arrivalUtc.Value != DateTime.MinValue
            && nowUtc >= arrivalUtc.Value)
        {
            trip.Status = TripStatus.Finished;
        }

        if (trip.Status != originalStatus)
        {
            await _repository.UpdateAsync(trip);
            await _repository.SaveChangesAsync();
        }
    }

    private async Task NotifyAdminsAsync(Trip trip, TripStatus oldStatus, TripStatus newStatus, string? jwtToken)
    {
        // Only notify on meaningful status transitions
        if (oldStatus == newStatus)
            return;

        if (newStatus != TripStatus.Started && newStatus != TripStatus.Delayed && newStatus != TripStatus.Finished)
            return;

        try
        {
            using var httpClient = new HttpClient();
            httpClient.BaseAddress = new Uri(_notificationServiceUrl);

            if (!string.IsNullOrEmpty(jwtToken))
            {
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);
            }

            var title = $"Trip Update: {trip.BusNumber}";
            var message = $"Trip {trip.BusNumber} ({trip.Id}) status changed to {newStatus}. Departure: {trip.DepartureTime:u}.";

            if (newStatus == TripStatus.Delayed)
            {
                message += $" Delay: {trip.DelayMinutes ?? 0} min.";
                if (!string.IsNullOrWhiteSpace(trip.DelayReason))
                    message += $" Reason: {trip.DelayReason}.";
                if (!string.IsNullOrWhiteSpace(trip.AdminContact))
                    message += $" Admin contact: {trip.AdminContact}.";
            }

            var payload = new
            {
                UserId = Guid.Empty,
                TargetRole = "Admin",
                Title = title,
                Message = message,
                Type = "TripUpdate"
            };

            await httpClient.PostAsJsonAsync("api/notification", payload);
        }
        catch
        {
            // Swallow errors - notification should not block status updates
        }
    }

    private static TripDto MapToDto(Trip trip)
    {
        return new TripDto
        {
            Id = trip.Id,
            RouteId = trip.RouteId,
            DriverId = trip.DriverId,
            VehicleId = trip.VehicleId,
            BusNumber = trip.BusNumber,
            DepartureTime = trip.DepartureTime,
            ArrivalTime = trip.ArrivalTime,
            TotalSeats = trip.TotalSeats,
            AvailableSeats = trip.AvailableSeats,
            Status = trip.Status,
            DelayMinutes = trip.DelayMinutes,
            DelayReason = trip.DelayReason,
            AdminContact = trip.AdminContact
        };
    }
}
