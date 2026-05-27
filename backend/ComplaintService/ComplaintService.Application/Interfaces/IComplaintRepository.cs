namespace ComplaintService.Application.Interfaces;

using ComplaintService.Domain.Entities;

public interface IComplaintRepository
{
    Task<IEnumerable<Complaint>> GetAllAsync();
    Task<Complaint?> GetByIdAsync(Guid id);
    Task<IEnumerable<Complaint>> GetByUserIdAsync(Guid userId);
    Task AddAsync(Complaint complaint);
    Task UpdateAsync(Complaint complaint);
    Task SaveChangesAsync();
}
