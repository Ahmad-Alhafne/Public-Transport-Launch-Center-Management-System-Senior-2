using System;
using AuditService.Domain.Enums;

namespace AuditService.Domain.Entities
{
    public class AuditRecord
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public Guid BookingId { get; set; }
        public Guid CitizenId { get; set; }
        public Guid AuditorId { get; set; }
        public DateTime ScanTime { get; set; }
        public AuditResult Result { get; set; }
        public string? Notes { get; set; }
    }
}
