using System;

namespace OrganizerService.Domain.Entities
{
    public class QueuePackage
    {
        public Guid Id { get; set; }
        public Guid RouteId { get; set; }
        public DateTime DepartureDate { get; set; }
        public int QueueOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
