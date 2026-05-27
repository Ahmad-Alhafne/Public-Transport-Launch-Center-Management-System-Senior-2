namespace TripService.Application.Services;

using TripService.Application.DTOs;
using TripService.Application.Interfaces;
using TripService.Domain.Entities;
using TripService.Domain.Enums;

public class DriverChangeRequestService : IDriverChangeRequestService
{
    private readonly List<DriverChangeRequest> _requests = new();
    private readonly IAuthServiceClient _authServiceClient;

    public DriverChangeRequestService(IAuthServiceClient authServiceClient)
    {
        _authServiceClient = authServiceClient;
    }

    public async Task<DriverChangeRequestDto?> GetRequestAsync(Guid requestId)
    {
        var request = _requests.FirstOrDefault(r => r.Id == requestId);
        return request == null ? null : MapToDto(request);
    }

    public async Task<List<DriverChangeRequestDto>> GetMyRequestsAsync(Guid driverId)
    {
        return _requests.Where(r => r.DriverId == driverId).Select(MapToDto).ToList();
    }

    public async Task<List<DriverChangeRequestDto>> GetAllRequestsAsync()
    {
        return _requests.Select(MapToDto).ToList();
    }

    public async Task<DriverChangeRequestDto> CreateRequestAsync(Guid driverId, CreateDriverChangeRequestDto dto)
    {
        var request = new DriverChangeRequest
        {
            DriverId = driverId,
            Type = (DriverChangeRequestType)dto.Type,
            CurrentValue = dto.CurrentValue,
            RequestedValue = dto.RequestedValue,
            Reason = dto.Reason,
            Status = DriverChangeRequestStatus.Pending
        };
        _requests.Add(request);
        return MapToDto(request);
    }

    public async Task<DriverChangeRequestDto> UpdateRequestStatusAsync(Guid requestId, UpdateDriverChangeRequestStatusDto dto)
    {
        var request = _requests.FirstOrDefault(r => r.Id == requestId);
        if (request == null) throw new KeyNotFoundException($"Request not found: {requestId}");

        var newStatus = (DriverChangeRequestStatus)dto.Status;
        request.Status = newStatus;
        request.AdminNotes = dto.AdminNotes;
        request.ResolvedAt = DateTime.UtcNow;

        // If approved, call AuthService to update user data
        if (newStatus == DriverChangeRequestStatus.Approved)
        {
            await ApplyChangeToAuthServiceAsync(request);
        }

        return MapToDto(request);
    }

    private async Task ApplyChangeToAuthServiceAsync(DriverChangeRequest request)
    {
        try
        {
            switch (request.Type)
            {
                case DriverChangeRequestType.PhoneNumber:
                    await _authServiceClient.UpdateUserPhoneAsync(request.DriverId, request.RequestedValue);
                    break;
                case DriverChangeRequestType.Password:
                    await _authServiceClient.UpdateUserPasswordAsync(request.DriverId, request.RequestedValue);
                    break;
                // RouteAssignment and ProfileData changes handled by TripService itself
            }
        }
        catch (Exception ex)
        {
            // Log error but don't fail the request approval
            Console.Error.WriteLine($"Error applying change to AuthService: {ex.Message}");
        }
    }

    private static DriverChangeRequestDto MapToDto(DriverChangeRequest request) =>
        new()
        {
            Id = request.Id,
            DriverId = request.DriverId,
            Type = (int)request.Type,
            Status = (int)request.Status,
            CurrentValue = request.CurrentValue,
            RequestedValue = request.RequestedValue,
            Reason = request.Reason,
            AdminNotes = request.AdminNotes,
            CreatedAt = request.CreatedAt,
            ResolvedAt = request.ResolvedAt
        };
}
