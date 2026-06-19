using OrganizerService.Application.Interfaces;
using OrganizerService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OrganizerService.Application.Services
{
    public class OrganizerQueueService
    {
        private readonly IOrganizerRepository _repo;
        private readonly ITripServiceClient _tripClient;

        public OrganizerQueueService(IOrganizerRepository repo, ITripServiceClient tripClient)
        {
            _repo = repo;
            _tripClient = tripClient;
        }

        public async Task<IEnumerable<QueuePackage>> GetAllPackagesAsync()
        {
            return await _repo.GetAllPackagesAsync();
        }

        public async Task<QueuePackage?> GetPackageAsync(Guid id)
        {
            return await _repo.GetPackageByIdAsync(id);
        }

        public async Task<IEnumerable<QueuePackageTrip>> GetPackageTripsAsync(Guid packageId)
        {
            return await _repo.GetTripsForPackageAsync(packageId);
        }

        public async Task AutoGroupByDateAsync(DateTime date)
        {
            var trips = await _tripClient.GetTripsByDateAsync(date);
            var groups = trips
                .Where(t => t != null)
                .GroupBy(t => new { route = (Guid?)t.routeId ?? (Guid?)t.RouteId, date = date.Date })
                .Where(g => g.Key.route.HasValue)
                .ToList();

            // Determine starting queue order
            var existing = (await _repo.GetAllPackagesAsync()).ToList();
            var nextOrder = existing.Any() ? existing.Max(p => p.QueueOrder) + 1 : 1;

            foreach (var g in groups)
            {
                var routeId = g.Key.route!.Value;
                // create package
                var pkg = new QueuePackage
                {
                    Id = Guid.NewGuid(),
                    RouteId = routeId,
                    DepartureDate = g.Key.date,
                    QueueOrder = nextOrder++,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _repo.CreatePackageAsync(pkg);

                // add trips
                var pos = 1;
                foreach (var t in g)
                {
                    Guid tripId;
                    try { tripId = (Guid)t.id; } catch { continue; }
                    var ppt = new QueuePackageTrip { Id = Guid.NewGuid(), QueuePackageId = pkg.Id, TripId = tripId, QueuePosition = pos++ };
                    await _repo.AddTripToPackageAsync(ppt);
                    await _repo.AddActionLogAsync(new OrganizerActionLog { Id = Guid.NewGuid(), OrganizerId = Guid.Empty, Action = "AddTripToPackage", Timestamp = DateTime.UtcNow, RelatedEntityId = tripId });
                }
                await _repo.AddActionLogAsync(new OrganizerActionLog { Id = Guid.NewGuid(), OrganizerId = Guid.Empty, Action = "CreatePackage", Timestamp = DateTime.UtcNow, RelatedEntityId = pkg.Id });
            }
        }

        public async Task ReorderPackagesAsync(IEnumerable<Guid> orderedPackageIds)
        {
            var pkgs = (await _repo.GetAllPackagesAsync()).ToDictionary(p => p.Id);
            var ordered = orderedPackageIds.Select((id, idx) =>
            {
                if (!pkgs.TryGetValue(id, out var p)) throw new Exception("Invalid package id");
                p.QueueOrder = idx + 1;
                return p;
            }).ToList();

            await _repo.UpdatePackagesOrderAsync(ordered);
            await _repo.AddActionLogAsync(new OrganizerActionLog { Id = Guid.NewGuid(), OrganizerId = Guid.Empty, Action = "ReorderPackages", Timestamp = DateTime.UtcNow, RelatedEntityId = null });
        }

        public async Task ReorderTripsAsync(Guid packageId, IEnumerable<Guid> orderedTripIds)
        {
            var trips = (await _repo.GetTripsForPackageAsync(packageId)).ToDictionary(t => t.TripId);
            var ordered = orderedTripIds.Select((tid, idx) =>
            {
                if (!trips.TryGetValue(tid, out var t)) throw new Exception("Invalid trip id");
                t.QueuePosition = idx + 1;
                return t;
            }).ToList();

            await _repo.UpdateTripsOrderAsync(packageId, ordered);
            await _repo.AddActionLogAsync(new OrganizerActionLog { Id = Guid.NewGuid(), OrganizerId = Guid.Empty, Action = "ReorderTrips", Timestamp = DateTime.UtcNow, RelatedEntityId = packageId });
        }

        public async Task MoveTripPositionAsync(Guid packageId, Guid tripId, int newPosition)
        {
            var trips = (await _repo.GetTripsForPackageAsync(packageId)).OrderBy(t => t.QueuePosition).ToList();
            var target = trips.FirstOrDefault(t => t.TripId == tripId);
            if (target == null) throw new Exception("Trip not in package");
            trips.Remove(target);
            newPosition = Math.Max(1, Math.Min(newPosition, trips.Count + 1));
            trips.Insert(newPosition - 1, target);
            // reassign positions
            var reordered = trips.Select((t, idx) => { t.QueuePosition = idx + 1; return t; }).ToList();
            await _repo.UpdateTripsOrderAsync(packageId, reordered);
            await _repo.AddActionLogAsync(new OrganizerActionLog { Id = Guid.NewGuid(), OrganizerId = Guid.Empty, Action = "MoveTrip", Timestamp = DateTime.UtcNow, RelatedEntityId = tripId });
        }

        public async Task AddTripToPackageAsync(Guid packageId, Guid tripId, int? position = null)
        {
            var trips = (await _repo.GetTripsForPackageAsync(packageId)).OrderBy(t => t.QueuePosition).ToList();
            if (trips.Any(t => t.TripId == tripId)) throw new Exception("Trip already in package");
            var pos = position ?? (trips.Count + 1);
            var ppt = new QueuePackageTrip { Id = Guid.NewGuid(), QueuePackageId = packageId, TripId = tripId, QueuePosition = pos };
            await _repo.AddTripToPackageAsync(ppt);
            // if position inserted in middle, shift others
            if (pos <= trips.Count)
            {
                var shifted = trips.Select(t =>
                {
                    if (t.QueuePosition >= pos) t.QueuePosition = t.QueuePosition + 1;
                    return t;
                }).ToList();
                await _repo.UpdateTripsOrderAsync(packageId, shifted);
            }
            await _repo.AddActionLogAsync(new OrganizerActionLog { Id = Guid.NewGuid(), OrganizerId = Guid.Empty, Action = "AddTripToPackage", Timestamp = DateTime.UtcNow, RelatedEntityId = tripId });
        }

        public async Task RemoveTripFromPackageAsync(Guid packageId, Guid tripId)
        {
            await _repo.RemoveTripFromPackageAsync(packageId, tripId);
            // compact positions
            var trips = (await _repo.GetTripsForPackageAsync(packageId)).OrderBy(t => t.QueuePosition).ToList();
            for (int i = 0; i < trips.Count; i++) trips[i].QueuePosition = i + 1;
            await _repo.UpdateTripsOrderAsync(packageId, trips);
            await _repo.AddActionLogAsync(new OrganizerActionLog { Id = Guid.NewGuid(), OrganizerId = Guid.Empty, Action = "RemoveTripFromPackage", Timestamp = DateTime.UtcNow, RelatedEntityId = tripId });
        }
    }
}
