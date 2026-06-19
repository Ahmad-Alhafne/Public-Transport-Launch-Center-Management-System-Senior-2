using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LiveTrackingService.Application.Interfaces;
using LiveTrackingService.Domain.Entities;
using LiveTrackingService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LiveTrackingService.Infrastructure.Repositories;

public class LiveTrackingRepository : ILiveTrackingRepository
{
    private readonly LiveTrackingDbContext _db;

    public LiveTrackingRepository(LiveTrackingDbContext db)
    {
        _db = db;
    }

    public async Task AddOrUpdateTrackingAsync(LiveTripTracking tracking)
    {
        var existing = await _db.LiveTripTrackings.FirstOrDefaultAsync(t => t.TripId == tracking.TripId);
        if (existing == null)
        {
            await _db.LiveTripTrackings.AddAsync(tracking);
        }
        else
        {
            existing.CurrentLatitude = tracking.CurrentLatitude;
            existing.CurrentLongitude = tracking.CurrentLongitude;
            existing.CurrentSpeed = tracking.CurrentSpeed;
            existing.LastUpdatedAt = tracking.LastUpdatedAt;
            existing.TrackingStatus = tracking.TrackingStatus;
        }
    }

    public async Task AddTrackingHistoryAsync(TrackingHistory history)
    {
        await _db.TrackingHistories.AddAsync(history);
    }

    public async Task<LiveTripTracking?> GetByTripIdAsync(Guid tripId)
    {
        return await _db.LiveTripTrackings.FirstOrDefaultAsync(t => t.TripId == tripId);
    }

    public async Task<IEnumerable<LiveTripTracking>> GetActiveTrackingsAsync()
    {
        return await _db.LiveTripTrackings.Where(t => t.TrackingStatus == "Active").ToListAsync();
    }

    public async Task<IEnumerable<TrackingHistory>> GetTrackingHistoryAsync(Guid tripId, int limit = 100)
    {
        return await _db.TrackingHistories.Where(h => h.TripId == tripId).OrderByDescending(h => h.Timestamp).Take(limit).ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }

    public async Task UpdateTrackingStatusForTripAsync(Guid tripId, string status)
    {
        var entries = await _db.LiveTripTrackings.Where(t => t.TripId == tripId).ToListAsync();
        if (entries.Count == 0) return;

        foreach (var e in entries)
        {
            e.TrackingStatus = status;
            e.LastUpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
    }
}
