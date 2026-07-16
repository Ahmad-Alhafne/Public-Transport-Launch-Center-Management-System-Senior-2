namespace PaymentService.Api.Models;

using System.ComponentModel.DataAnnotations;

public class ConfirmPaymentRequest
{
    [Required]
    public string PaymentIntentId { get; set; } = string.Empty;
    // Either provide `PaymentMethodToken` (recommended for front-end tokens like `tok_visa`/`pm_*`)
    // or provide raw card details (only for tests). Validation is performed server-side.
    public string? CardNumber { get; set; }

    public int? ExpMonth { get; set; }

    public int? ExpYear { get; set; }

    public string? Cvc { get; set; }

    public string? PaymentMethodToken { get; set; }
}
