using TripService.Domain.Entities;
using TripService.Domain.Enums;

namespace TripService.Application.Interfaces;

public interface IEmergencyRepository
{
    Task AddAsync(EmergencyReport report);
    Task<EmergencyReport?> GetByIdAsync(Guid id);
    Task<IEnumerable<EmergencyReport>> GetByTripIdAsync(Guid tripId);
    Task<IEnumerable<EmergencyReport>> GetAllAsync(EmergencyStatus? status = null, EmergencyPriority? priority = null, EmergencyType? type = null, Guid? tripId = null);
    Task UpdateAsync(EmergencyReport report);
    Task DeleteAsync(EmergencyReport report);
    Task SaveChangesAsync();
}
