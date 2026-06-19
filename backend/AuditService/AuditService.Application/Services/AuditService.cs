using AuditService.Application.Interfaces;
using AuditService.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace AuditService.Application.Services
{
    public class AuditService
    {
        private readonly IAuditRepository _repo;

        public AuditService(IAuditRepository repo)
        {
            _repo = repo;
        }

        public async Task<bool> TryAssignTripAsync(Guid tripId, Guid auditorId)
        {
            // Delegates to repository which must implement DB-level locking
            return await _repo.TryAssignTripAsync(tripId, auditorId);
        }

        public async Task AddRecordAsync(AuditRecord record)
        {
            await _repo.AddAuditRecordAsync(record);
        }
    }
}
