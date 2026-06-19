using System;
using AuditService.Domain.Enums;

namespace AuditService.Domain.Entities
{
    public class TripAudit
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public Guid AuditorId { get; set; }
        public DateTime AssignedAt { get; set; }
        public AuditStatus Status { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
