namespace ComplaintService.Infrastructure.Repositories;

using ComplaintService.Application.Interfaces;
using ComplaintService.Domain.Entities;
using ComplaintService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

public class ComplaintRepository : IComplaintRepository
{
    private readonly ComplaintDbContext _dbContext;

    public ComplaintRepository(ComplaintDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<Complaint>> GetAllAsync()
    {
        return await _dbContext.Complaints.OrderByDescending(c => c.CreatedAt).ToListAsync();
    }

    public async Task<Complaint?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Complaints.FindAsync(id);
    }

    public async Task<IEnumerable<Complaint>> GetByUserIdAsync(Guid userId)
    {
        return await _dbContext.Complaints.Where(c => c.UserId == userId).OrderByDescending(c => c.CreatedAt).ToListAsync();
    }

    public async Task AddAsync(Complaint complaint)
    {
        await _dbContext.Complaints.AddAsync(complaint);
    }

    public Task UpdateAsync(Complaint complaint)
    {
        _dbContext.Complaints.Update(complaint);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}
