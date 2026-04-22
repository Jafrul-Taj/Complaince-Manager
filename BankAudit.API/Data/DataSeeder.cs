using BankAudit.API.Entities;
using BankAudit.API.Enums;

namespace BankAudit.API.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (!context.Users.Any(u => u.Role == UserRole.Operator))
        {
            context.Users.Add(new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                FullName = "System Administrator",
                Role = UserRole.Operator,
                Email = "admin@bankaudit.com",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }
    }
}
