namespace AuthService.Application.Services;

using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Enums;

public class UserQueryService : IUserQueryService
{
    private readonly IUserRepository _userRepository;

    public UserQueryService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserSummaryDto>> GetDriversAsync()
    {
        var drivers = await _userRepository.GetByRoleAsync(Role.Driver);
        return drivers.Select(d => new UserSummaryDto
        {
            Id = d.Id,
            FullName = d.FullName,
                Email = d.Email,
                PhoneNumber = d.PhoneNumber,
                CreatedAt = d.CreatedAt
        });
    }

    public async Task<IEnumerable<UserSummaryDto>> GetUsersByIdsAsync(List<Guid> userIds)
    {
        var users = new List<UserSummaryDto>();
        foreach (var userId in userIds)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user != null)
            {
                users.Add(new UserSummaryDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    CreatedAt = user.CreatedAt
                });
            }
        }
        return users;
    }
}

