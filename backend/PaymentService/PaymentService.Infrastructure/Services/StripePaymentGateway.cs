namespace PaymentService.Infrastructure.Services;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PaymentService.Application.DTOs;
using PaymentService.Application.Interfaces;
using Stripe;

public class StripePaymentGateway : IStripePaymentGateway
{
    private readonly StripeOptions _options;
    private readonly PaymentIntentService _paymentIntentService;
    private readonly ILogger<StripePaymentGateway> _logger;

    public StripePaymentGateway(IOptions<StripeOptions> options, ILogger<StripePaymentGateway> logger)
    {
        _options = options.Value;
        StripeConfiguration.ApiKey = _options.SecretKey ?? string.Empty;
        _paymentIntentService = new PaymentIntentService();
        _logger = logger;
    }

    public async Task<PaymentIntentResult> CreatePaymentIntentAsync(decimal amount, string currency)
    {
        // Log intent creation attempt (helpful for debugging transient Stripe issues)
        try
        {
            _logger?.LogInformation("CreatePaymentIntentAsync called: Amount={amount}, Currency={currency}", amount, currency);
        }
        catch { }

        var options = new PaymentIntentCreateOptions
        {
            Amount = Convert.ToInt64(Math.Round(amount * 100, MidpointRounding.AwayFromZero)),
            Currency = currency.ToLowerInvariant(),
            PaymentMethodTypes = new List<string> { "card" }
        };

        var intent = await _paymentIntentService.CreateAsync(options);
        return MapIntent(intent);
    }

    public async Task<PaymentIntentResult> ConfirmPaymentIntentAsync(string paymentIntentId, string cardNumber, long expMonth, long expYear, string cvc, string? paymentMethodToken)
    {
        // If a payment method token/id is provided (e.g. tok_visa or pm_...), use it directly or convert it.
        string? paymentMethodId = string.IsNullOrWhiteSpace(paymentMethodToken) ? null : paymentMethodToken;

        // Log what we're about to send to Stripe (mask sensitive data)
        try
        {
            var masked = new { paymentIntentId, paymentMethodToken = paymentMethodId != null ? (paymentMethodId.StartsWith("tok_") ? "tok_***" : paymentMethodId) : null, cardProvided = !string.IsNullOrWhiteSpace(cardNumber) };
            _logger?.LogInformation("ConfirmPaymentIntentAsync called: {@masked}", masked);
        }
        catch { }

        var paymentMethodService = new PaymentMethodService();

        // If a legacy token like `tok_visa` was provided, convert it into a PaymentMethod first.
        if (!string.IsNullOrWhiteSpace(paymentMethodId) && paymentMethodId.StartsWith("tok_"))
        {
            var paymentMethodOptions = new PaymentMethodCreateOptions
            {
                Type = "card",
                Card = new PaymentMethodCardOptions
                {
                    Token = paymentMethodId
                }
            };

            var paymentMethod = await paymentMethodService.CreateAsync(paymentMethodOptions);
            paymentMethodId = paymentMethod.Id;
        }

        if (string.IsNullOrWhiteSpace(paymentMethodId))
        {
            // No token provided, require raw card details (test-only).
            if (string.IsNullOrWhiteSpace(cardNumber) || expMonth <= 0 || expYear <= 0 || string.IsNullOrWhiteSpace(cvc))
                throw new ArgumentException("Either paymentMethodToken or full card details are required.");

            var paymentMethodOptions = new PaymentMethodCreateOptions
            {
                Type = "card",
                Card = new PaymentMethodCardOptions
                {
                    Number = cardNumber.Replace(" ", string.Empty),
                    ExpMonth = expMonth,
                    ExpYear = expYear,
                    Cvc = cvc
                }
            };

            var paymentMethod = await paymentMethodService.CreateAsync(paymentMethodOptions);
            paymentMethodId = paymentMethod.Id;
        }

        var confirmOptions = new PaymentIntentConfirmOptions
        {
            PaymentMethod = paymentMethodId
        };

        try
        {
            _logger?.LogInformation("ConfirmOptions: PaymentMethod={pm}", confirmOptions.PaymentMethod);
            var intent = await _paymentIntentService.ConfirmAsync(paymentIntentId, confirmOptions);
            return MapIntent(intent);
        }
        catch (StripeException ex)
        {
            _logger?.LogWarning(ex, "Stripe confirm failed for paymentToken={token}", paymentMethodToken);

            if (!string.IsNullOrWhiteSpace(cardNumber) && expMonth > 0 && expYear > 0 && !string.IsNullOrWhiteSpace(cvc) &&
                ex.StripeError?.Code == "parameter_invalid_empty")
            {
                _logger?.LogInformation("Falling back to raw card details after token confirm failure.");
                var fallbackPaymentMethodOptions = new PaymentMethodCreateOptions
                {
                    Type = "card",
                    Card = new PaymentMethodCardOptions
                    {
                        Number = cardNumber.Replace(" ", string.Empty),
                        ExpMonth = expMonth,
                        ExpYear = expYear,
                        Cvc = cvc
                    }
                };

                var fallbackPaymentMethod = await paymentMethodService.CreateAsync(fallbackPaymentMethodOptions);
                confirmOptions = new PaymentIntentConfirmOptions
                {
                    PaymentMethod = fallbackPaymentMethod.Id
                };

                var fallbackIntent = await _paymentIntentService.ConfirmAsync(paymentIntentId, confirmOptions);
                return MapIntent(fallbackIntent);
            }

            throw;
        }
    }

    public async Task<PaymentIntentResult> GetPaymentIntentAsync(string paymentIntentId)
    {
        var intent = await _paymentIntentService.GetAsync(paymentIntentId);
        return MapIntent(intent);
    }

    public async Task<bool> RefundAsync(string paymentIntentId, long amountInCents)
    {
        try
        {
            var refundService = new RefundService();
            var options = new RefundCreateOptions
            {
                PaymentIntent = paymentIntentId,
                Amount = amountInCents
            };

            var refund = await refundService.CreateAsync(options);
            return refund != null;
        }
        catch (StripeException ex)
        {
            _logger?.LogWarning(ex, "Stripe refund failed for PaymentIntent={paymentIntentId}", paymentIntentId);
            throw;
        }
    }

    private static PaymentIntentResult MapIntent(PaymentIntent intent)
    {
        return new PaymentIntentResult
        {
            Id = intent.Id,
            ClientSecret = intent.ClientSecret ?? string.Empty,
            Status = intent.Status ?? string.Empty,
            Amount = intent.Amount / 100m,
            Currency = intent.Currency ?? string.Empty
        };
    }
}
