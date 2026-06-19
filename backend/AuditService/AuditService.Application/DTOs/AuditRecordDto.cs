using AuditService.Domain.Enums;
using System;

namespace AuditService.Application.DTOs
{
    public class AuditRecordDto
    {
        public Guid BookingId { get; set; }
        public Guid CitizenId { get; set; }
        public Guid TripId { get; set; }
        public AuditResult Result { get; set; }
        public string? Notes { get; set; }
    }
}
