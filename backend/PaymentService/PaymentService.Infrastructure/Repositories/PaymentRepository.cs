namespace PaymentService.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;
using PaymentService.Domain.Entities;
using PaymentService.Domain.Interfaces;
using PaymentService.Infrastructure.Data;

public class PaymentRepository : IPaymentRepository
{
    private readonly PaymentDbContext _dbContext;

    public PaymentRepository(PaymentDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(Payment payment)
    {
        await _dbContext.Payments.AddAsync(payment);
    }

    public async Task<Payment?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Payments.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Payment?> GetByPaymentIntentIdAsync(string paymentIntentId)
    {
        return await _dbContext.Payments.FirstOrDefaultAsync(p => p.PaymentIntentId == paymentIntentId);
    }

    public Task UpdateAsync(Payment payment)
    {
        _dbContext.Payments.Update(payment);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}
