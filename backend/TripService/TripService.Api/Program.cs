using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;
using TripService.Api.Middleware;
using TripService.Application.Interfaces;
using TripService.Application.Services;
using TripService.Infrastructure.Data;
using TripService.Infrastructure.Repositories;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<TripDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), sqlOptions =>
        sqlOptions.EnableRetryOnFailure()));

builder.Services.AddScoped<ITripRepository, TripRepository>();
builder.Services.AddHttpClient<IVehicleServiceClient, TripService.Infrastructure.Clients.VehicleServiceClient>();
builder.Services.AddHttpClient<IRouteServiceClient, TripService.Infrastructure.Clients.RouteServiceClient>();
builder.Services.AddHttpClient<IAuthServiceClient, TripService.Infrastructure.Clients.AuthServiceClient>();
builder.Services.AddHttpClient<IBookingServiceClient, TripService.Infrastructure.Clients.BookingServiceClient>();

// Register driver profile repo/service so DI can resolve it for TripManagementService
builder.Services.AddScoped<IDriverProfileRepository, DriverProfileRepository>();
builder.Services.AddScoped<IDriverProfileService, DriverProfileService>();

// Construct TripManagementService explicitly, passing the driver repo and notification URL
builder.Services.AddScoped<ITripService>(sp =>
    new TripService.Application.Services.TripManagementService(
        sp.GetRequiredService<ITripRepository>(),
        sp.GetRequiredService<IVehicleServiceClient>(),
        sp.GetRequiredService<IRouteServiceClient>(),
        sp.GetRequiredService<IAuthServiceClient>(),
        sp.GetRequiredService<IDriverProfileRepository>(),
        builder.Configuration["ServiceUrls:NotificationService"] ?? "http://localhost:5010"
    )
);

// Emergency services and repo
builder.Services.AddScoped<IEmergencyRepository, TripService.Infrastructure.Repositories.EmergencyRepository>();
builder.Services.AddScoped<IEmergencyService>(sp =>
    new TripService.Application.Services.EmergencyService(
        sp.GetRequiredService<IEmergencyRepository>(),
        sp.GetRequiredService<ITripRepository>(),
        sp.GetRequiredService<IBookingServiceClient>(),
        builder.Configuration["ServiceUrls:NotificationService"] ?? "http://localhost:5010",
        sp.GetRequiredService<ILogger<TripService.Application.Services.EmergencyService>>()
    )
);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
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
        logger.LogError(ex, "An error occurred while seeding the Trip database.");
    }
}

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
