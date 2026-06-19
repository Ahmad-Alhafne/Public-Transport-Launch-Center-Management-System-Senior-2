using LiveTrackingService.Application.Interfaces;
using LiveTrackingService.Application.Services;
using LiveTrackingService.Infrastructure.Data;
using LiveTrackingService.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// RabbitMQ configuration
var rabbitMqOptions = builder.Configuration.GetSection("RabbitMq").Get<LiveTrackingService.Api.Messaging.RabbitMqOptions>() ?? new LiveTrackingService.Api.Messaging.RabbitMqOptions();
builder.Services.AddSingleton(rabbitMqOptions);
builder.Services.AddSingleton<LiveTrackingService.Api.Messaging.IRabbitMqConnection, LiveTrackingService.Api.Messaging.RabbitMqConnection>();
builder.Services.AddSingleton<LiveTrackingService.Api.Messaging.IRabbitMqEventPublisher, LiveTrackingService.Api.Messaging.RabbitMqEventPublisher>();

// Infrastructure
builder.Services.AddDbContext<LiveTrackingDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), sqlOptions => sqlOptions.EnableRetryOnFailure()));

builder.Services.AddScoped<ILiveTrackingRepository, LiveTrackingRepository>();

// Application
builder.Services.AddScoped<LiveTrackingService.Application.Services.LiveTrackingService>();

// HttpClient for calling TripService
builder.Services.AddHttpClient("TripService", client =>
{
    // Prefer configured ServiceUrls:TripService (set via environment variable
    // ServiceUrls__TripService in docker-compose). Fall back to the internal
    // docker service hostname so the container can reach TripService.
    var baseUrl = builder.Configuration["ServiceUrls:TripService"] ?? "http://tripservice:8080/";
    client.BaseAddress = new Uri(baseUrl);
});

// Http client for calling AuthService (to resolve driver names)
builder.Services.AddHttpClient("AuthService", client =>
{
    var baseUrl = builder.Configuration["ServiceUrls:AuthService"] ?? "http://authservice:8080/";
    client.BaseAddress = new Uri(baseUrl);
});

// log configured TripService base address for easier debugging
var tripServiceUrl = builder.Configuration["ServiceUrls:TripService"] ?? "(not set, using default http://tripservice:8080/)";
var startupLogger = LoggerFactory.Create(lb => lb.AddConsole()).CreateLogger("Startup");
startupLogger.LogInformation("TripService base URL = {Url}", tripServiceUrl);

// Hosted service to synchronize trip status from TripService -> LiveTracking
builder.Services.AddHostedService<LiveTrackingService.Api.HostedServices.TripStatusSyncService>();

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtOptions:Issuer"],
            ValidAudience = builder.Configuration["JwtOptions:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtOptions:SecretKey"] ?? "secret"))
        };
        // Allow SignalR WebSocket connections to pass access token via query string
        options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"].FirstOrDefault();
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/live-tracking"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();
// Apply pending EF migrations (create DB/tables) on startup for development
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<LiveTrackingDbContext>();
        try
        {
            db.Database.EnsureCreated();
        }
        catch (Exception ensureEx)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogWarning(ensureEx, "EnsureCreated failed for LiveTrackingDB; will attempt Migrate");
        }

        try
        {
            db.Database.Migrate();
        }
        catch (Exception migEx)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogWarning(migEx, "Migrate failed for LiveTrackingDB (likely no migrations) — continuing");
        }
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Failed to initialize LiveTracking database on startup");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<LiveTrackingService.Api.Hubs.LiveTrackingHub>("/hubs/live-tracking");

app.Run();
