using OrganizerService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OrganizerService.Application.Interfaces
{
    public interface IOrganizerRepository
    {
        Task<Organizer> CreateAsync(Organizer organizer);
        Task UpdateAsync(Organizer organizer);
        Task DeleteAsync(Guid id);
        Task<Organizer?> GetByIdAsync(Guid id);
        Task<IEnumerable<Organizer>> GetAllAsync();
        Task AddActionLogAsync(OrganizerActionLog log);
        // Queue package management
        Task<IEnumerable<QueuePackage>> GetAllPackagesAsync();
        Task<QueuePackage?> GetPackageByIdAsync(Guid id);
        Task<IEnumerable<QueuePackageTrip>> GetTripsForPackageAsync(Guid packageId);
        Task<QueuePackage> CreatePackageAsync(QueuePackage pkg);
        Task UpdatePackageAsync(QueuePackage pkg);
        Task DeletePackageAsync(Guid id);
        Task AddTripToPackageAsync(QueuePackageTrip trip);
        Task RemoveTripFromPackageAsync(Guid packageId, Guid tripId);
        Task UpdateTripsOrderAsync(Guid packageId, IEnumerable<QueuePackageTrip> orderedTrips);
        Task UpdatePackagesOrderAsync(IEnumerable<QueuePackage> orderedPackages);
    }
}
