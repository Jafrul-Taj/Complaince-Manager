using BankAudit.API.Data;
using BankAudit.API.DTOs.Users;
using BankAudit.API.Entities;
using BankAudit.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;
    private readonly ILogger<UserService> _logger;

    public UserService(AppDbContext db, ILogger<UserService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<UserDto>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all {Entity}s", nameof(User));

            var users = await _db.Users
                .OrderBy(u => u.FullName)
                .Select(u => ToDto(u))
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} {Entity}s", users.Count, nameof(User));
            return users;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all {Entity}s", nameof(User));
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        try
        {
            _logger.LogInformation("Retrieving {Entity} with ID {UserId}", nameof(User), id);

            var user = await _db.Users.FindAsync(id);
            if (user is null)
            {
                _logger.LogWarning("{Entity} with ID {UserId} not found", nameof(User), id);
                return null;
            }

            return ToDto(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving {Entity} with ID {UserId}", nameof(User), id);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request)
    {
        try
        {
            _logger.LogInformation(
                "Creating {Entity} — Username: {Username}, Role: {Role}",
                nameof(User), request.Username, request.Role);

            var user = new User
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                Role = request.Role,
                Email = request.Email,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            _logger.LogInformation("{Entity} created with ID {UserId}", nameof(User), user.Id);
            return ToDto(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating {Entity} with Username: {Username}", nameof(User), request.Username);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<UserDto?> UpdateAsync(int id, UpdateUserRequest request)
    {
        try
        {
            _logger.LogInformation("Updating {Entity} with ID {UserId}", nameof(User), id);

            var user = await _db.Users.FindAsync(id);
            if (user is null)
            {
                _logger.LogWarning("{Entity} with ID {UserId} not found", nameof(User), id);
                return null;
            }

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.IsActive = request.IsActive;

            if (!string.IsNullOrWhiteSpace(request.NewPassword))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                _logger.LogInformation("Password updated for {Entity} with ID {UserId}", nameof(User), id);
            }

            await _db.SaveChangesAsync();

            _logger.LogInformation("{Entity} with ID {UserId} updated successfully", nameof(User), id);
            return ToDto(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating {Entity} with ID {UserId}", nameof(User), id);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            _logger.LogInformation("Deleting {Entity} with ID {UserId}", nameof(User), id);

            var user = await _db.Users.FindAsync(id);
            if (user is null)
            {
                _logger.LogWarning("{Entity} with ID {UserId} not found for deletion", nameof(User), id);
                return false;
            }

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();

            _logger.LogInformation("{Entity} with ID {UserId} deleted successfully", nameof(User), id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting {Entity} with ID {UserId}", nameof(User), id);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    private static UserDto ToDto(User u) => new()
    {
        Id = u.Id,
        Username = u.Username,
        FullName = u.FullName,
        Role = u.Role.ToString(),
        Email = u.Email,
        IsActive = u.IsActive,
        CreatedAt = u.CreatedAt
    };
}
