namespace AuthService.Application.Interfaces;

using AuthService.Application.DTOs;

public interface IUserQueryService
{
    Task<IEnumerable<UserSummaryDto>> GetDriversAsync();
    Task<IEnumerable<UserSummaryDto>> GetUsersByIdsAsync(List<Guid> userIds);
}

