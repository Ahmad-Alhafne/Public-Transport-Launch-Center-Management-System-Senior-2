using OrganizerService.Application.Services;
using OrganizerService.Infrastructure.Data;
using OrganizerService.Infrastructure.Repositories;
using OrganizerService.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<OrganizerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), sqlOptions =>
        sqlOptions.EnableRetryOnFailure()));

// Repositories & Services
builder.Services.AddScoped<IOrganizerRepository, OrganizerRepository>();
builder.Services.AddScoped<OrganizerService.Application.Services.OrganizerService>();
builder.Services.AddScoped<OrganizerService.Application.Services.OrganizerQueueService>();
var tripServiceUrl = builder.Configuration["ServiceUrls:TripService"] ?? "http://tripservice:8080";
builder.Services.AddHttpClient<OrganizerService.Application.Interfaces.ITripServiceClient, OrganizerService.Infrastructure.HttpClients.TripServiceClient>(client =>
{
    client.BaseAddress = new Uri(tripServiceUrl);
});

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Authentication & Authorization (mirror AuditService config)
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
        var db = scope.ServiceProvider.GetRequiredService<OrganizerDbContext>();
        try
        {
            db.Database.EnsureCreated();
        }
        catch { }

        try
        {
            db.Database.Migrate();
        }
        catch { }
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Failed to initialize OrganizerService database on startup");
    }
}

app.Run();
