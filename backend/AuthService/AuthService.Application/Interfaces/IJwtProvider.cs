namespace AuthService.Application.Interfaces;

using AuthService.Domain.Entities;

public interface IJwtProvider
{
    string Generate(User user);
}
