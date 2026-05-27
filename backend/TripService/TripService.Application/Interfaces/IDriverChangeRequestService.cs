namespace TripService.Application.Interfaces;

using TripService.Application.DTOs;

public interface IDriverChangeRequestService
{
    Task<DriverChangeRequestDto?> GetRequestAsync(Guid requestId);
    Task<List<DriverChangeRequestDto>> GetMyRequestsAsync(Guid driverId);
    Task<List<DriverChangeRequestDto>> GetAllRequestsAsync();
    Task<DriverChangeRequestDto> CreateRequestAsync(Guid driverId, CreateDriverChangeRequestDto dto);
    Task<DriverChangeRequestDto> UpdateRequestStatusAsync(Guid requestId, UpdateDriverChangeRequestStatusDto dto);
}
