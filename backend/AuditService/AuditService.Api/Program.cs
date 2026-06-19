using AuditService.Application.Services;
using AuditService.Infrastructure.Data;
using AuditService.Infrastructure.Repositories;
using AuditService.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// RabbitMQ configuration for integration events
var rabbitMqOptions = builder.Configuration.GetSection("RabbitMq").Get<AuditService.Api.Messaging.RabbitMqOptions>() ?? new AuditService.Api.Messaging.RabbitMqOptions();
builder.Services.AddSingleton(rabbitMqOptions);
builder.Services.AddSingleton<AuditService.Api.Messaging.IRabbitMqConnection, AuditService.Api.Messaging.RabbitMqConnection>();
builder.Services.AddHostedService<AuditService.Api.Messaging.RabbitMqEventConsumerHostedService>();
builder.Services.AddScoped<AuditService.Api.Messaging.AuditIntegrationEventHandler>();

// Database
builder.Services.AddDbContext<AuditDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), sqlOptions =>
        sqlOptions.EnableRetryOnFailure()));

// Repositories & Services
builder.Services.AddScoped<IAuditRepository, AuditRepository>();
builder.Services.AddScoped<AuditService.Application.Services.AuditService>();
var bookingServiceUrl = builder.Configuration["ServiceUrls:BookingService"] ?? "http://bookingservice:8080";
builder.Services.AddHttpClient<AuditService.Application.Interfaces.IBookingServiceClient, AuditService.Infrastructure.HttpClients.BookingServiceClient>(client =>
{
    client.BaseAddress = new Uri(bookingServiceUrl);
});

var tripServiceUrl = builder.Configuration["ServiceUrls:TripService"] ?? "http://tripservice:8080";
builder.Services.AddHttpClient<AuditService.Application.Interfaces.ITripServiceClient, AuditService.Infrastructure.HttpClients.TripServiceClient>(client =>
{
    client.BaseAddress = new Uri(tripServiceUrl);
});

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Authentication & Authorization
var jwtSection = builder.Configuration.GetSection("JwtOptions");
var jwtKey = jwtSection["SecretKey"] ?? "THIS_IS_A_LONG_SHARED_SECRET_KEY_123456789";
var jwtIssuer = jwtSection["Issuer"] ?? "DepartureCenter";
var jwtAudience = jwtSection["Audience"] ?? "DepartureCenterUsers";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Apply pending EF migrations (create DB/tables) on startup for development
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AuditDbContext>();
        // In development, ensure database and schema exist even if migrations are not present
        try
        {
            db.Database.EnsureCreated();
        }
        catch (Exception ensureEx)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogWarning(ensureEx, "EnsureCreated failed for AuditDB; will attempt Migrate");
        }

        try
        {
            db.Database.Migrate();
        }
        catch (Exception migEx)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogWarning(migEx, "Migrate failed for AuditDB (likely no migrations) — continuing");
        }
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Failed to initialize AuditService database on startup");
    }
}

app.Run();
