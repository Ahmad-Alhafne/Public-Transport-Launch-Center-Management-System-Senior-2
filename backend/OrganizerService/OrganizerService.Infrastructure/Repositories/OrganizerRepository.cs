using Microsoft.EntityFrameworkCore;
using OrganizerService.Application.Interfaces;
using OrganizerService.Domain.Entities;
using OrganizerService.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OrganizerService.Infrastructure.Repositories
{
    public class OrganizerRepository : IOrganizerRepository
    {
        private readonly OrganizerDbContext _db;

        public OrganizerRepository(OrganizerDbContext db)
        {
            _db = db;
        }

        public async Task<Organizer> CreateAsync(Organizer organizer)
        {
            _db.Organizers.Add(organizer);
            await _db.SaveChangesAsync();
            return organizer;
        }

        public async Task DeleteAsync(Guid id)
        {
            var e = await _db.Organizers.FindAsync(id);
            if (e == null) return;
            _db.Organizers.Remove(e);
            await _db.SaveChangesAsync();
        }

        public async Task<IEnumerable<Organizer>> GetAllAsync()
        {
            return await _db.Organizers.AsNoTracking().ToListAsync();
        }

        public async Task<IEnumerable<QueuePackage>> GetAllPackagesAsync()
        {
            return await _db.QueuePackages.OrderBy(p => p.QueueOrder).AsNoTracking().ToListAsync();
        }

        public async Task<QueuePackage?> GetPackageByIdAsync(Guid id)
        {
            return await _db.QueuePackages.FindAsync(id);
        }

        public async Task<IEnumerable<QueuePackageTrip>> GetTripsForPackageAsync(Guid packageId)
        {
            return await _db.QueuePackageTrips.Where(t => t.QueuePackageId == packageId).OrderBy(t => t.QueuePosition).AsNoTracking().ToListAsync();
        }

        public async Task<QueuePackage> CreatePackageAsync(QueuePackage pkg)
        {
            _db.QueuePackages.Add(pkg);
            await _db.SaveChangesAsync();
            return pkg;
        }

        public async Task UpdatePackageAsync(QueuePackage pkg)
        {
            _db.QueuePackages.Update(pkg);
            await _db.SaveChangesAsync();
        }

        public async Task DeletePackageAsync(Guid id)
        {
            var p = await _db.QueuePackages.FindAsync(id);
            if (p == null) return;
            var trips = _db.QueuePackageTrips.Where(t => t.QueuePackageId == id);
            _db.QueuePackageTrips.RemoveRange(trips);
            _db.QueuePackages.Remove(p);
            await _db.SaveChangesAsync();
        }

        public async Task AddTripToPackageAsync(QueuePackageTrip trip)
        {
            // Ensure no duplicate position for this package
            var exists = await _db.QueuePackageTrips.AnyAsync(t => t.QueuePackageId == trip.QueuePackageId && t.QueuePosition == trip.QueuePosition);
            if (exists) throw new Exception("Duplicate queue position");
            _db.QueuePackageTrips.Add(trip);
            await _db.SaveChangesAsync();
        }

        public async Task RemoveTripFromPackageAsync(Guid packageId, Guid tripId)
        {
            var e = await _db.QueuePackageTrips.FirstOrDefaultAsync(t => t.QueuePackageId == packageId && t.TripId == tripId);
            if (e == null) return;
            _db.QueuePackageTrips.Remove(e);
            await _db.SaveChangesAsync();
        }

        public async Task UpdateTripsOrderAsync(Guid packageId, IEnumerable<QueuePackageTrip> orderedTrips)
        {
            // Validate duplicates
            var positions = orderedTrips.Select(t => t.QueuePosition).ToList();
            if (positions.Count != positions.Distinct().Count()) throw new Exception("Duplicate queue positions detected");

            foreach (var t in orderedTrips)
            {
                var existing = await _db.QueuePackageTrips.FirstOrDefaultAsync(x => x.QueuePackageId == packageId && x.TripId == t.TripId);
                if (existing != null)
                {
                    existing.QueuePosition = t.QueuePosition;
                    _db.QueuePackageTrips.Update(existing);
                }
            }
            await _db.SaveChangesAsync();
        }

        public async Task UpdatePackagesOrderAsync(IEnumerable<QueuePackage> orderedPackages)
        {
            var orders = orderedPackages.Select(p => p.QueueOrder).ToList();
            if (orders.Count != orders.Distinct().Count()) throw new Exception("Duplicate package queue orders detected");

            foreach (var p in orderedPackages)
            {
                var existing = await _db.QueuePackages.FindAsync(p.Id);
                if (existing != null)
                {
                    existing.QueueOrder = p.QueueOrder;
                    existing.UpdatedAt = DateTime.UtcNow;
                    _db.QueuePackages.Update(existing);
                }
            }
            await _db.SaveChangesAsync();
        }

        public async Task AddActionLogAsync(OrganizerActionLog log)
        {
            _db.OrganizerActionLogs.Add(log);
            await _db.SaveChangesAsync();
        }

        public async Task<Organizer?> GetByIdAsync(Guid id)
        {
            return await _db.Organizers.FindAsync(id);
        }

        public async Task UpdateAsync(Organizer organizer)
        {
            _db.Organizers.Update(organizer);
            await _db.SaveChangesAsync();
        }
    }
}
