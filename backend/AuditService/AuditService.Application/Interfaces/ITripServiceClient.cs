using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuditService.Application.Interfaces
{
    public interface ITripServiceClient
    {
        Task<IEnumerable<TripDto>?> GetAllTripsAsync(string? bearerToken = null);
    }

    public class TripDto
    {
        public Guid Id { get; set; }
        public Guid RouteId { get; set; }
        public Guid DriverId { get; set; }
        public Guid VehicleId { get; set; }
        public string BusNumber { get; set; } = string.Empty;
        public DateTime DepartureTime { get; set; }
        public DateTime? ArrivalTime { get; set; }
        public int TotalSeats { get; set; }
        public int AvailableSeats { get; set; }
        public string? Status { get; set; }
    }
}
