namespace ComplaintService.Application.DTOs;

using ComplaintService.Domain.Enums;

public class RespondToComplaintDto
{
    public ComplaintStatus Status { get; set; }
    public string AdminResponse { get; set; } = string.Empty;
}
