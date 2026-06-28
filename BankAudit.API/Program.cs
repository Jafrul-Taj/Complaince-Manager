using System.Text;
using System.Text.Json.Serialization;
using BankAudit.API.Data;
using BankAudit.API.Middleware;
using BankAudit.API.Services;
using BankAudit.API.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NLog;
using NLog.Web;

// Bootstrap NLog before WebApplication so startup crashes are captured in the log file.
var logger = NLog.LogManager.Setup()
    .LoadConfigurationFromFile("nlog.config")
    .GetCurrentClassLogger();

try
{
    logger.Info("=== BankAudit API starting up ===");

    var builder = WebApplication.CreateBuilder(args);

    // Replace the default Microsoft logging pipeline with NLog.
    builder.Logging.ClearProviders();
    builder.Host.UseNLog();

    // Allow large Excel uploads (up to 100 MB)
    builder.WebHost.ConfigureKestrel(kestrel =>
    {
        kestrel.Limits.MaxRequestBodySize = 100 * 1024 * 1024;
    });
    builder.Services.Configure<FormOptions>(form =>
    {
        form.MultipartBodyLengthLimit = 100 * 1024 * 1024;
        form.ValueLengthLimit         = int.MaxValue;
        form.MultipartHeadersLengthLimit = int.MaxValue;
    });

    // EF Core + SQLite
    builder.Services.AddDbContext<AppDbContext>(opt =>
        opt.UseSqlite(builder.Configuration.GetConnectionString("Default")));

    // JWT Authentication
    var jwtKey = builder.Configuration["Jwt:Key"]!;
    var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtIssuer,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
            };
        });

    builder.Services.AddAuthorization();

    // DI — Services
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IUserService, UserService>();
    builder.Services.AddScoped<IBranchService, BranchService>();
    builder.Services.AddScoped<IAssignmentService, AssignmentService>();
    builder.Services.AddScoped<IFindingService, FindingService>();
    builder.Services.AddScoped<IDashboardService, DashboardService>();
    builder.Services.AddScoped<IComplianceAuditReportService, ComplianceAuditReportService>();

    builder.Services.AddControllers()
        .AddJsonOptions(o =>
            o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
    builder.Services.AddEndpointsApiExplorer();

    // Swagger with JWT Bearer support
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Bank Audit API", Version = "v1" });
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter JWT token"
        });
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                },
                Array.Empty<string>()
            }
        });
    });

    // CORS for Angular dev
    builder.Services.AddCors(opt =>
        opt.AddDefaultPolicy(p => p
            .WithOrigins(
                "http://localhost:4200",
                "http://localhost:8080",
                "http://localhost",
                "http://172.25.47.105",
                "http://172.25.47.105:8080",
                "http://172.25.47.105:5000",
                "http://compliance.ucb.com.bd:8080",
                "http://compliance.ucb.com.bd"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()));

    var app = builder.Build();

    // Seed initial Operator user
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await DataSeeder.SeedAsync(db);
    }

    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseMiddleware<ExceptionMiddleware>();
    app.UseCors();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    logger.Info("=== BankAudit API ready — listening for requests ===");

    app.Run();
}
catch (Exception ex)
{
    logger.Fatal(ex, "BankAudit API terminated unexpectedly during startup");
    throw;
}
finally
{
    // Flush all pending log writes and release file handles before process exits.
    NLog.LogManager.Shutdown();
}
