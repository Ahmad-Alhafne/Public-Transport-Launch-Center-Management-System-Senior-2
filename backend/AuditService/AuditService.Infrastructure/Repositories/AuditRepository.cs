using AuditService.Application.Interfaces;
using AuditService.Domain.Entities;
using AuditService.Domain.Enums;
using AuditService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuditService.Infrastructure.Repositories
{
    public class AuditRepository : IAuditRepository
    {
        private readonly AuditDbContext _db;
        private readonly ILogger<AuditRepository> _logger;

        public AuditRepository(AuditDbContext db, ILogger<AuditRepository> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task AddAuditRecordAsync(AuditRecord record)
        {
            _db.AuditRecords.Add(record);
            await _db.SaveChangesAsync();
        }

        public async Task CreateTripAuditAsync(TripAudit tripAudit)
        {
            _db.TripAudits.Add(tripAudit);
            await _db.SaveChangesAsync();
        }

        public async Task<TripAudit?> GetTripAuditForTripAsync(Guid tripId)
        {
            return await _db.TripAudits.FirstOrDefaultAsync(t => t.TripId == tripId && t.Status != AuditStatus.Cancelled);
        }

        public async Task<IEnumerable<TripAudit>> GetAssignedTripsForAuditorAsync(Guid auditorId)
        {
            return await _db.TripAudits.Where(t => t.AuditorId == auditorId && t.Status != AuditStatus.Cancelled && t.Status != AuditStatus.Completed).ToListAsync();
        }

        public async Task<IEnumerable<AuditRecord>> GetAuditRecordsForTripAsync(Guid tripId)
        {
            return await _db.AuditRecords.Where(r => r.TripId == tripId).ToListAsync();
        }

        public async Task UpdateTripAuditAsync(TripAudit tripAudit)
        {
            _db.TripAudits.Update(tripAudit);
            await _db.SaveChangesAsync();
        }

        // Important: implement DB-level concurrency via transaction and row versioning or unique constraint.
        public async Task<bool> TryAssignTripAsync(Guid tripId, Guid auditorId)
        {
            // Use the execution strategy to ensure the manual transaction is executed as a retriable unit
            var strategy = _db.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                using var tx = await _db.Database.BeginTransactionAsync();
                try
                {
                    var existing = await _db.TripAudits.FirstOrDefaultAsync(t => t.TripId == tripId && t.Status != AuditStatus.Cancelled && t.Status != AuditStatus.Completed);
                    if (existing != null)
                    {
                        return false;
                    }

                    var newAudit = new TripAudit
                    {
                        Id = Guid.NewGuid(),
                        TripId = tripId,
                        AuditorId = auditorId,
                        AssignedAt = DateTime.UtcNow,
                        Status = AuditStatus.Assigned
                    };

                    _db.TripAudits.Add(newAudit);
                    await _db.SaveChangesAsync();
                    await tx.CommitAsync();
                    return true;
                }
                catch (Exception ex)
                {
                    try { await tx.RollbackAsync(); } catch {}
                    _logger.LogError(ex, "TryAssignTripAsync failed for TripId={TripId}, AuditorId={AuditorId}", tripId, auditorId);
                    return false;
                }
            });
        }
    }
}
