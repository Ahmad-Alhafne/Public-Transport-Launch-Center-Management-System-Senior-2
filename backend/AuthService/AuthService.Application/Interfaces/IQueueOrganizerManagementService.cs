using AuthService.Application.DTOs;
using System;
using System.Threading.Tasks;

namespace AuthService.Application.Interfaces
{
    public interface IQueueOrganizerManagementService
    {
        Task<UserSummaryDto> CreateQueueOrganizerAsync(CreateAuditorDto dto);
        Task<UserSummaryDto> UpdateQueueOrganizerAsync(Guid id, UpdateUserDto dto);
        Task DeleteQueueOrganizerAsync(Guid id);
        Task<UserSummaryDto> UpdateQueueOrganizerPasswordAsync(Guid id, string newPassword);
        Task<UserSummaryDto> UpdateQueueOrganizerPhoneAsync(Guid id, string phoneNumber);
    }
}
