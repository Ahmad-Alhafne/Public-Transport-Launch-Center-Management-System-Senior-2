namespace ComplaintService.Application.DTOs;

using ComplaintService.Domain.Enums;

public class ComplaintDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ComplaintStatus Status { get; set; }
    public string AdminResponse { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
