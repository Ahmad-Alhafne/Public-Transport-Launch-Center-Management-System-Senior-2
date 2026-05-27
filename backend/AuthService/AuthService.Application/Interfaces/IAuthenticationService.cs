namespace AuthService.Application.Interfaces;

using AuthService.Application.DTOs;

public interface IAuthenticationService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
}
