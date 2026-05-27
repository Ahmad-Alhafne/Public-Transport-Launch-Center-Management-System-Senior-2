namespace ComplaintService.Application.Services;

using ComplaintService.Application.DTOs;
using ComplaintService.Application.Interfaces;
using ComplaintService.Domain.Entities;
using ComplaintService.Domain.Enums;
using System.Text.Json;

public class ComplaintManagementService : IComplaintService
{
    private readonly IComplaintRepository _repository;
    private readonly HttpClient _httpClient;

    public ComplaintManagementService(IComplaintRepository repository, HttpClient httpClient)
    {
        _repository = repository;
        _httpClient = httpClient;
    }

    public async Task<IEnumerable<ComplaintDto>> GetAllComplaintsAsync()
    {
        var complaints = await _repository.GetAllAsync();
        return complaints.Select(MapToDto);
    }

    public async Task<ComplaintDto> GetComplaintByIdAsync(Guid id)
    {
        var complaint = await _repository.GetByIdAsync(id);
        if (complaint == null)
            throw new Exception($"Complaint with ID {id} not found.");
        return MapToDto(complaint);
    }

    public async Task<IEnumerable<ComplaintDto>> GetComplaintsByUserIdAsync(Guid userId)
    {
        var complaints = await _repository.GetByUserIdAsync(userId);
        return complaints.Select(MapToDto);
    }

    public async Task<ComplaintDto> CreateComplaintAsync(CreateComplaintDto dto, Guid userId, string userName, string userRole)
    {
        var complaint = new Complaint
        {
            UserId = userId,
            UserName = userName,
            UserRole = userRole,
            Subject = dto.Subject,
            Description = dto.Description,
            Status = ComplaintStatus.Pending
        };

        await _repository.AddAsync(complaint);
        await _repository.SaveChangesAsync();
        return MapToDto(complaint);
    }

    public async Task<ComplaintDto> UpdateComplaintStatusAsync(Guid id, UpdateComplaintStatusDto dto)
    {
        var complaint = await _repository.GetByIdAsync(id);
        if (complaint == null)
            throw new Exception($"Complaint with ID {id} not found.");

        complaint.Status = dto.Status;
        await _repository.UpdateAsync(complaint);
        await _repository.SaveChangesAsync();
        return MapToDto(complaint);
    }

    public async Task<ComplaintDto> RespondToComplaintAsync(Guid id, RespondToComplaintDto dto)
    {
        var complaint = await _repository.GetByIdAsync(id);
        if (complaint == null)
            throw new Exception($"Complaint with ID {id} not found.");

        complaint.Status = dto.Status;
        complaint.AdminResponse = dto.AdminResponse;
        await _repository.UpdateAsync(complaint);
        await _repository.SaveChangesAsync();

        // Create notification for the user
        await CreateComplaintNotificationAsync(complaint, dto.Status);

        return MapToDto(complaint);
    }

    private async Task CreateComplaintNotificationAsync(Complaint complaint, ComplaintStatus status)
    {
        try
        {
            var notificationRequest = new
            {
                userId = complaint.UserId,
                title = $"Complaint Update: {complaint.Subject}",
                message = $"Your complaint has been {status.ToString().ToLower()}. Admin response: {complaint.AdminResponse}",
                type = 0 // ComplaintUpdate enum value
            };

            var content = new StringContent(
                JsonSerializer.Serialize(notificationRequest),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync("http://notificationservice:5010/api/notification", content);
            // Optionally log if notification creation fails, but don't fail the complaint response
            if (!response.IsSuccessStatusCode)
            {
                // Log warning but don't throw
                System.Diagnostics.Debug.WriteLine($"Failed to create notification: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            // Log but don't fail the complaint response
            System.Diagnostics.Debug.WriteLine($"Error creating notification: {ex.Message}");
        }
    }

    private static ComplaintDto MapToDto(Complaint complaint)
    {
        return new ComplaintDto
        {
            Id = complaint.Id,
            UserId = complaint.UserId,
            UserName = complaint.UserName,
            UserRole = complaint.UserRole,
            Subject = complaint.Subject,
            Description = complaint.Description,
            Status = complaint.Status,
            AdminResponse = complaint.AdminResponse,
            CreatedAt = complaint.CreatedAt
        };
    }
}
