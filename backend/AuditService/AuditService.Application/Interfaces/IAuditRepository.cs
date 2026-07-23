using AuditService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuditService.Application.Interfaces
{
    public interface IAuditRepository
    {
        Task<TripAudit?> GetTripAuditForTripAsync(Guid tripId);
        Task<IEnumerable<TripAudit>> GetAssignedTripsForAuditorAsync(Guid auditorId);
        Task<bool> TryAssignTripAsync(Guid tripId, Guid auditorId);
        Task AddAuditRecordAsync(AuditRecord record);
        Task<IEnumerable<AuditRecord>> GetAuditRecordsForTripAsync(Guid tripId);
        Task<IEnumerable<AuditRecord>> GetAuditRecordsForAuditorAsync(Guid auditorId);
        Task CreateTripAuditAsync(TripAudit tripAudit);
        Task UpdateTripAuditAsync(TripAudit tripAudit);
    }
}
