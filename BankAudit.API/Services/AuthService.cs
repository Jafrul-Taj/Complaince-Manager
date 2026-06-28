using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BankAudit.API.Data;
using BankAudit.API.DTOs.Auth;
using BankAudit.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BankAudit.API.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(AppDbContext db, IConfiguration config, ILogger<AuthService> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        try
        {
            _logger.LogInformation("Login attempt for username: {Username}", request.Username);

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

            if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                _logger.LogWarning("Failed login attempt for username: {Username}", request.Username);
                return null;
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiry = DateTime.UtcNow.AddMinutes(double.Parse(_config["Jwt:ExpiryMinutes"]!));

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("fullName", user.FullName)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                claims: claims,
                expires: expiry,
                signingCredentials: creds);

            _logger.LogInformation(
                "Login successful for UserId: {UserId}, Username: {Username}, Role: {Role}, TokenExpiry: {Expiry}",
                user.Id, user.Username, user.Role, expiry);

            return new LoginResponse
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Role = user.Role.ToString(),
                FullName = user.FullName,
                UserId = user.Id,
                ExpiresAt = expiry
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for username: {Username}", request.Username);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }
}
