using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LiveTrackingService.Domain.Entities;

namespace LiveTrackingService.Application.Interfaces;

public interface ILiveTrackingRepository
{
    Task<LiveTripTracking?> GetByTripIdAsync(Guid tripId);
    Task AddOrUpdateTrackingAsync(LiveTripTracking tracking);
    Task AddTrackingHistoryAsync(TrackingHistory history);
    Task<IEnumerable<LiveTripTracking>> GetActiveTrackingsAsync();
    Task<IEnumerable<TrackingHistory>> GetTrackingHistoryAsync(Guid tripId, int limit = 100);
    Task SaveChangesAsync();
    Task UpdateTrackingStatusForTripAsync(Guid tripId, string status);
}
