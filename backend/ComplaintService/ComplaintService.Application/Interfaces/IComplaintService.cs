namespace ComplaintService.Application.Interfaces;

using ComplaintService.Application.DTOs;

public interface IComplaintService
{
    Task<IEnumerable<ComplaintDto>> GetAllComplaintsAsync();
    Task<ComplaintDto> GetComplaintByIdAsync(Guid id);
    Task<IEnumerable<ComplaintDto>> GetComplaintsByUserIdAsync(Guid userId);
    Task<ComplaintDto> CreateComplaintAsync(CreateComplaintDto dto, Guid userId, string userName, string userRole);
    Task<ComplaintDto> UpdateComplaintStatusAsync(Guid id, UpdateComplaintStatusDto dto);
    Task<ComplaintDto> RespondToComplaintAsync(Guid id, RespondToComplaintDto dto);
}
