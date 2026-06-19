using System;
using System.Threading.Tasks;

namespace AuditService.Application.Interfaces
{
    public interface IBookingServiceClient
    {
        Task<BookingSummary?> GetBookingAsync(Guid bookingId);
    }

    public class BookingSummary
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public Guid PassengerId { get; set; }
        public string? PassengerName { get; set; }
        public string? Status { get; set; }
        public string? QrToken { get; set; }
        public DateTime TripDepartureTimeUtc { get; set; }
    }
}
