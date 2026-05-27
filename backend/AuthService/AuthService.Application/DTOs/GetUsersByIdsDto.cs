namespace AuthService.Application.DTOs;

public class GetUsersByIdsDto
{
    public List<Guid> UserIds { get; set; } = new();
}
