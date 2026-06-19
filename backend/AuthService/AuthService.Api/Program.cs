using AuthService.Api.Middleware;
using AuthService.Application.Interfaces;
using AuthService.Application.Services;
using AuthService.Infrastructure.Authentication;
using AuthService.Infrastructure.Data;
using AuthService.Infrastructure.HttpClients;
using AuthService.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Infrastructure
builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), sqlOptions =>
        sqlOptions.EnableRetryOnFailure()));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IJwtProvider, JwtProvider>();

var tripServiceUrl = builder.Configuration["ServiceUrls:TripService"] ?? "http://localhost:5002";

builder.Services.AddHttpClient<ITripServiceClient, TripServiceClient>(client =>
{
    client.BaseAddress = new Uri(tripServiceUrl);
});

// Application
builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IUserQueryService, UserQueryService>();
builder.Services.AddScoped<IDriverManagementService, DriverManagementService>();
builder.Services.AddScoped<IAuditorManagementService, AuditorManagementService>();
builder.Services.AddScoped<IQueueOrganizerManagementService, QueueOrganizerManagementService>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var jwtIssuer = builder.Configuration["JwtOptions:Issuer"] ?? "DepartureCenter";
var jwtAudience = builder.Configuration["JwtOptions:Audience"] ?? "DepartureCenterUsers";
var jwtSecret = builder.Configuration["JwtOptions:SecretKey"];

if (string.IsNullOrWhiteSpace(jwtSecret))
{
    jwtSecret = "THIS_IS_A_LONG_SHARED_SECRET_KEY_123456789";
    Console.WriteLine("WARNING: JwtOptions:SecretKey is not set for AuthService; using default development secret.");
}

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
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            // Allow a small amount of clock skew to avoid token rejection due to time drift
            ClockSkew = TimeSpan.FromMinutes(5)
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
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.UseMiddleware<ExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
