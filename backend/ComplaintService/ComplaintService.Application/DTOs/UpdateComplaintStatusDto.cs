namespace ComplaintService.Application.DTOs;

using ComplaintService.Domain.Enums;

public class UpdateComplaintStatusDto
{
    public ComplaintStatus Status { get; set; }
}
