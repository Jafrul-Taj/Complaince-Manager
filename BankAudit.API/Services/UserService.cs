using BankAudit.API.Data;
using BankAudit.API.DTOs.Users;
using BankAudit.API.Entities;
using BankAudit.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db) => _db = db;

    public async Task<List<UserDto>> GetAllAsync()
    {
        return await _db.Users
            .OrderBy(u => u.FullName)
            .Select(u => ToDto(u))
            .ToListAsync();
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _db.Users.FindAsync(id);
        return user is null ? null : ToDto(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request)
    {
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
        return ToDto(user);
    }

    public async Task<UserDto?> UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return null;

        user.FullName = request.FullName;
        user.Email = request.Email;
        user.IsActive = request.IsActive;

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        await _db.SaveChangesAsync();
        return ToDto(user);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return false;
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return true;
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
