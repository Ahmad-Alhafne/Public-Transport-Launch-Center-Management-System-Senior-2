namespace PaymentService.Domain.Enums;

public enum PaymentStatus
{
    Pending,
    Succeeded,
    PartiallyRefunded,
    Refunded,
    Failed,
    RequiresAction
}
