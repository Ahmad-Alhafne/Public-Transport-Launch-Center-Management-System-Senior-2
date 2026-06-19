namespace AuthService.Application.Interfaces;

using AuthService.Application.DTOs;

public interface IUserQueryService
{
    Task<IEnumerable<UserSummaryDto>> GetDriversAsync();
    Task<IEnumerable<UserSummaryDto>> GetAuditorsAsync();
    Task<IEnumerable<UserSummaryDto>> GetUsersByRoleAsync(AuthService.Domain.Enums.Role role);
    Task<IEnumerable<UserSummaryDto>> GetUsersByIdsAsync(List<Guid> userIds);
}

