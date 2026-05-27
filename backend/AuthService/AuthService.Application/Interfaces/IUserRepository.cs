namespace AuthService.Application.Interfaces;

using AuthService.Domain.Entities;
using AuthService.Domain.Enums;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task<IEnumerable<User>> GetByRoleAsync(Role role);
    Task<IEnumerable<User>> GetByIdsAsync(IEnumerable<Guid> ids);
    Task AddAsync(User user);
    void Remove(User user);
    Task SaveChangesAsync();
}
