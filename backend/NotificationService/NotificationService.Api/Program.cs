using NotificationService.Api.BackgroundServices;
using NotificationService.Api.Channels;
using NotificationService.Api.Handlers;
using NotificationService.Api.Hubs;
using NotificationService.Api.Messaging;
using NotificationService.Api.Middleware;
using NotificationService.Application.Interfaces;
using NotificationService.Application.Services;
using NotificationService.Infrastructure.Data;
using NotificationService.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// RabbitMQ configuration
var rabbitMqOptions = builder.Configuration.GetSection("RabbitMq").Get<RabbitMqOptions>() ?? new RabbitMqOptions();
builder.Services.AddSingleton(rabbitMqOptions);
builder.Services.AddSingleton<IRabbitMqConnection, RabbitMqConnection>();
builder.Services.AddSingleton<IRabbitMqEventPublisher, RabbitMqEventPublisher>();

// Infrastructure
builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), sqlOptions =>
        sqlOptions.EnableRetryOnFailure()));

builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

// Application
builder.Services.AddScoped<INotificationManagementService, NotificationManagementService>();
builder.Services.AddScoped<INotificationPreferenceService, NotificationPreferenceService>();
builder.Services.AddScoped<INotificationTemplateService, NotificationTemplateService>();
builder.Services.AddScoped<IReminderService, ReminderService>();

// AuthService client for user language lookup
builder.Services.AddHttpClient<NotificationService.Api.Clients.IAuthServiceClient, NotificationService.Api.Clients.AuthServiceClient>(client =>
{
    var authUrl = builder.Configuration["ServiceUrls:AuthService"] ?? builder.Configuration["AuthServiceUrl"] ?? "http://localhost:5104";
    client.BaseAddress = new Uri(authUrl.TrimEnd('/') + "/");
});

// Channels
builder.Services.AddSignalR();
builder.Services.AddSingleton<INotificationChannel, InAppNotificationChannel>();
// Push sender selection: prefer FCM if configured, otherwise use Expo
var fcmKey = builder.Configuration["Fcm:ServerKey"];
if (!string.IsNullOrEmpty(fcmKey))
{
    // Use FCM as default sender
    builder.Services.AddHttpClient<NotificationService.Application.Interfaces.INotificationSender, NotificationService.Api.Channels.FcmNotificationSender>();
    // Also register Expo sender as a concrete type if needed
    builder.Services.AddHttpClient<NotificationService.Api.Channels.ExpoNotificationSender>();
}
else
{
    // Default to Expo sender
    builder.Services.AddHttpClient<NotificationService.Application.Interfaces.INotificationSender, NotificationService.Api.Channels.ExpoNotificationSender>();
    builder.Services.AddHttpClient<NotificationService.Api.Channels.FcmNotificationSender>();
}

// Hosted services
builder.Services.AddScoped<NotificationIntegrationEventHandler>();
builder.Services.AddHostedService<RabbitMqEventConsumerHostedService>();
builder.Services.AddHostedService<TripReminderBackgroundService>();
// Poll provider receipts (e.g., Expo) and reconcile PushDelivery records
builder.Services.AddHostedService<PushReceiptPollingService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Authentication
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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtOptions:SecretKey"]!))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"].FirstOrDefault();
                if (!string.IsNullOrEmpty(accessToken) && context.HttpContext.Request.Path.StartsWithSegments("/hubs/notifications"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    try
    {
        await DbSeeder.SeedAsync(scope.ServiceProvider);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the Notification database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
