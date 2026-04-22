using BankAudit.API.DTOs.Auth;

namespace BankAudit.API.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}
