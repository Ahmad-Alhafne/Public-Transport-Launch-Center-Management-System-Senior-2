using Microsoft.EntityFrameworkCore;
using TripService.Application.Interfaces;
using TripService.Domain.Entities;
using TripService.Domain.Enums;
using TripService.Infrastructure.Data;

namespace TripService.Infrastructure.Repositories;

public class EmergencyRepository : IEmergencyRepository
{
    private readonly TripDbContext _db;

    public EmergencyRepository(TripDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(EmergencyReport report)
    {
        await _db.EmergencyReports.AddAsync(report);
    }

    public async Task<EmergencyReport?> GetByIdAsync(Guid id)
    {
        return await _db.EmergencyReports.FindAsync(id);
    }

    public async Task<IEnumerable<EmergencyReport>> GetByTripIdAsync(Guid tripId)
    {
        return await _db.EmergencyReports.Where(e => e.TripId == tripId).OrderByDescending(e=>e.CreatedAt).ToListAsync();
    }

    public async Task<IEnumerable<EmergencyReport>> GetAllAsync(EmergencyStatus? status = null, EmergencyPriority? priority = null, EmergencyType? type = null, Guid? tripId = null)
    {
        var query = _db.EmergencyReports.AsQueryable();

        if (status.HasValue)
            query = query.Where(e => e.Status == status.Value);

        if (priority.HasValue)
            query = query.Where(e => e.Priority == priority.Value);

        if (type.HasValue)
            query = query.Where(e => e.Type == type.Value);

        if (tripId.HasValue)
            query = query.Where(e => e.TripId == tripId.Value);

        return await query.OrderByDescending(e => e.CreatedAt).ToListAsync();
    }

    public Task UpdateAsync(EmergencyReport report)
    {
        _db.EmergencyReports.Update(report);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(EmergencyReport report)
    {
        _db.EmergencyReports.Remove(report);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }
}
