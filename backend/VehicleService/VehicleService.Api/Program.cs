using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using VehicleService.Application.Interfaces;
using VehicleService.Application.Services;
using VehicleService.Infrastructure.Data;
using VehicleService.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<VehicleDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), sqlOptions =>
        sqlOptions.EnableRetryOnFailure()));

builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<IVehicleService, VehicleManagementService>();

builder.Services.AddControllers().AddJsonOptions(options =>
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
    jwtSecret = "VerySecretKey12345!ChangeMe";
    Console.WriteLine("WARNING: JwtOptions:SecretKey is not configured; using default secret (dev only). Set the value in environment or appsettings.");
}

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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

var app = builder.Build();

// Ensure the vehicle database is created and migrates on startup.
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<VehicleDbContext>();
        db.Database.Migrate();
        logger.LogInformation("VehicleService database migrated successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to migrate VehicleService database.");
        throw; // fail fast so docker health is broken until DB issue fixed
    }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
