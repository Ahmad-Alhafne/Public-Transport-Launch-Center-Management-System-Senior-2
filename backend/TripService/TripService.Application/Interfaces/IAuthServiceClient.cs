namespace TripService.Application.Interfaces;

public interface IAuthServiceClient
{
    Task UpdateUserPhoneAsync(Guid userId, string phoneNumber, string? jwtToken = null);
    Task UpdateUserPasswordAsync(Guid userId, string newPassword, string? jwtToken = null);
    Task<bool> UserExistsAsync(Guid userId, string? jwtToken = null);
}
