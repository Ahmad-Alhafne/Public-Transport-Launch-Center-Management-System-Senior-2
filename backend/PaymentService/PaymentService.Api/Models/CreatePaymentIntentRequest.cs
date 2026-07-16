namespace PaymentService.Api.Models;

using System.ComponentModel.DataAnnotations;

public class CreatePaymentIntentRequest
{
    [Required]
    public Guid BookingId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(8, MinimumLength = 3)]
    public string Currency { get; set; } = "usd";

    [Required]
    [StringLength(64, MinimumLength = 1)]
    public string PaymentMethod { get; set; } = string.Empty;
}
