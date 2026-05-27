namespace AuthService.Application.Interfaces;

using AuthService.Application.DTOs;

public interface IDriverManagementService
{
    Task<UserSummaryDto> CreateDriverAsync(CreateDriverDto dto);
    Task<UserSummaryDto> UpdateDriverAsync(Guid id, UpdateDriverDto dto);
    Task DeleteDriverAsync(Guid id);
    Task<UserSummaryDto> UpdateUserPhoneAsync(Guid id, string phoneNumber);
    Task<UserSummaryDto> UpdateUserPasswordAsync(Guid id, string newPassword);
}

