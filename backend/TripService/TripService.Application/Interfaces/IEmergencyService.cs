using TripService.Application.DTOs;
using TripService.Domain.Enums;

namespace TripService.Application.Interfaces;

public interface IEmergencyService
{
    Task<EmergencyDto> CreateEmergencyAsync(CreateEmergencyDto dto, Guid reporterId, string reporterRole, string? jwtToken = null);
    Task<IEnumerable<EmergencyDto>> GetAllAsync(EmergencyStatus? status = null, EmergencyPriority? priority = null, EmergencyType? type = null, Guid? tripId = null);
    Task<EmergencyDto> GetByIdAsync(Guid id);
    Task<IEnumerable<EmergencyDto>> GetByTripIdAsync(Guid tripId);
    Task<EmergencyDto> UpdateStatusAsync(Guid id, UpdateEmergencyStatusDto dto, string? jwtToken = null);
}
