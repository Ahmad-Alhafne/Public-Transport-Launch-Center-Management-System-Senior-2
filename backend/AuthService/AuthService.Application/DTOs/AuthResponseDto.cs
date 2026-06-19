namespace AuthService.Application.DTOs;

using AuthService.Domain.Enums;

public class AuthResponseDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Role Role { get; set; }
    public string Token { get; set; } = string.Empty;
    public string LanguagePreference { get; set; } = "ar";
}
