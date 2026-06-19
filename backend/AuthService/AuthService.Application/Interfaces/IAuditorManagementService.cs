using AuthService.Application.DTOs;
using AuthService.Application.DTOs;

namespace AuthService.Application.Interfaces;

public interface IAuditorManagementService
{
    Task<UserSummaryDto> CreateAuditorAsync(CreateAuditorDto dto);
    Task<UserSummaryDto> UpdateAuditorAsync(Guid id, UpdateUserDto dto);
    Task DeleteAuditorAsync(Guid id);
    Task<UserSummaryDto> UpdateAuditorPasswordAsync(Guid id, string newPassword);
    Task<UserSummaryDto> UpdateAuditorPhoneAsync(Guid id, string phoneNumber);
}
