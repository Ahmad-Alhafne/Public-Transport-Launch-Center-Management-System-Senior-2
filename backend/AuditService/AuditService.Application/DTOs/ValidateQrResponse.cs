using System;
using AuditService.Domain.Enums;

namespace AuditService.Application.DTOs
{
    public class ValidateQrResponse
    {
        public Guid? BookingId { get; set; }
        public Guid? CitizenId { get; set; }
        public Guid? TripId { get; set; }
        public DateTime? BookedAt { get; set; }
        public AuditResult Result { get; set; }
        public string? Message { get; set; }
        public string? PassengerName { get; set; }
        public string? ExpectedVehicle { get; set; }
    }
}

