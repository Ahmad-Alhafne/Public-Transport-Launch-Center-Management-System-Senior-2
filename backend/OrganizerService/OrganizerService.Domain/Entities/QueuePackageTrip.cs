using System;

namespace OrganizerService.Domain.Entities
{
    public class QueuePackageTrip
    {
        public Guid Id { get; set; }
        public Guid QueuePackageId { get; set; }
        public Guid TripId { get; set; }
        public int QueuePosition { get; set; }
    }
}
