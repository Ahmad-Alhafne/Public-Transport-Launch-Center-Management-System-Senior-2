namespace AuthService.Application.Interfaces;

using AuthService.Application.DTOs;

public interface IUserManagementService
{
    Task<IEnumerable<UserSummaryDto>> GetAllUsersAsync();
    Task<IEnumerable<UserSummaryDto>> GetUsersByRoleAsync(AuthService.Domain.Enums.Role role);
    Task<UserSummaryDto?> GetUserByIdAsync(Guid id);
    Task<IEnumerable<UserSummaryDto>> GetUsersByIdsAsync(IEnumerable<Guid> ids);
    Task<UserSummaryDto> UpdateUserAsync(Guid id, UpdateUserDto dto);
    Task DeleteUserAsync(Guid id);

    Task<AdminProfileDto> GetMyProfileAsync(Guid userId);
    Task<AdminProfileDto> UpdateMyProfileAsync(Guid userId, AdminProfileDto dto);
}
