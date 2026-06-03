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

// Channels
builder.Services.AddSignalR();
builder.Services.AddSingleton<INotificationChannel, InAppNotificationChannel>();

// Hosted services
builder.Services.AddScoped<NotificationIntegrationEventHandler>();
builder.Services.AddHostedService<RabbitMqEventConsumerHostedService>();
builder.Services.AddHostedService<TripReminderBackgroundService>();

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
