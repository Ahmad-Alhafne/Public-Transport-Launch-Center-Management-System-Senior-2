using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LiveTrackingService.Application.DTOs;
using LiveTrackingService.Application.Interfaces;
using LiveTrackingService.Domain.Entities;

namespace LiveTrackingService.Application.Services;

public class LiveTrackingService
{
    private readonly ILiveTrackingRepository _repository;

    public LiveTrackingService(ILiveTrackingRepository repository)
    {
        _repository = repository;
    }

    public async Task UpdateLocationAsync(TrackingDto dto)
    {
        var existing = await _repository.GetByTripIdAsync(dto.TripId);
        var now = dto.Timestamp == default ? DateTime.UtcNow : dto.Timestamp;

        if (existing == null)
        {
            existing = new LiveTripTracking
            {
                Id = Guid.NewGuid(),
                TripId = dto.TripId,
                DriverId = dto.DriverId,
                VehicleId = dto.VehicleId,
                CurrentLatitude = dto.Latitude,
                CurrentLongitude = dto.Longitude,
                CurrentSpeed = dto.Speed,
                LastUpdatedAt = now,
                TrackingStatus = "Active"
            };

            await _repository.AddOrUpdateTrackingAsync(existing);
        }
        else
        {
            existing.CurrentLatitude = dto.Latitude;
            existing.CurrentLongitude = dto.Longitude;
            existing.CurrentSpeed = dto.Speed;
            existing.LastUpdatedAt = now;
            existing.TrackingStatus = "Active";

            await _repository.AddOrUpdateTrackingAsync(existing);
        }

        var history = new TrackingHistory
        {
            Id = Guid.NewGuid(),
            TripId = dto.TripId,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Speed = dto.Speed,
            Timestamp = now
        };

        await _repository.AddTrackingHistoryAsync(history);
        await _repository.SaveChangesAsync();
    }

    public Task<IEnumerable<LiveTripTracking>> GetActiveAsync() => _repository.GetActiveTrackingsAsync();
    public Task<IEnumerable<TrackingHistory>> GetHistoryAsync(Guid tripId, int limit = 100) => _repository.GetTrackingHistoryAsync(tripId, limit);

    public async Task StopTrackingAsync(Guid tripId)
    {
        // Update all rows that match this TripId to handle potential duplicate entries
        await _repository.UpdateTrackingStatusForTripAsync(tripId, "Finished");
    }
}
