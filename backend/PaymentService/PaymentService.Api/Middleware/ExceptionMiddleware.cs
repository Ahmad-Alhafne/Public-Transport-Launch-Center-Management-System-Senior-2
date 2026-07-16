namespace PaymentService.Api.Middleware;

using System.Net;
using System.Text.Json;
using Stripe;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await _next(httpContext);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception has occurred.");
            await HandleExceptionAsync(httpContext, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        if (exception is StripeException stripeEx)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            var response = new
            {
                StatusCode = context.Response.StatusCode,
                Message = stripeEx.StripeError?.Message ?? stripeEx.Message,
                StripeError = stripeEx.StripeError == null ? null : new { stripeEx.StripeError.Type, stripeEx.StripeError.Code }
            };
            return context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }

        context.Response.StatusCode = exception switch
        {
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            ArgumentException => (int)HttpStatusCode.BadRequest,
            InvalidOperationException => (int)HttpStatusCode.BadRequest,
            _ => (int)HttpStatusCode.InternalServerError
        };

        var generic = new
        {
            StatusCode = context.Response.StatusCode,
            Message = exception.Message
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(generic));
    }
}
