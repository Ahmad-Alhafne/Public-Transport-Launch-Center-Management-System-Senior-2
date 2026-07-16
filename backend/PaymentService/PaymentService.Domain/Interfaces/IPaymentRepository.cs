namespace PaymentService.Domain.Interfaces;

using PaymentService.Domain.Entities;

public interface IPaymentRepository
{
    Task AddAsync(Payment payment);
    Task<Payment?> GetByIdAsync(Guid id);
    Task<Payment?> GetByPaymentIntentIdAsync(string paymentIntentId);
    Task UpdateAsync(Payment payment);
    Task SaveChangesAsync();
}
