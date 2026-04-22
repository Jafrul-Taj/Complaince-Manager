using BankAudit.API.DTOs.Users;

namespace BankAudit.API.Services.Interfaces;

public interface IUserService
{
    Task<List<UserDto>> GetAllAsync();
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto> CreateAsync(CreateUserRequest request);
    Task<UserDto?> UpdateAsync(int id, UpdateUserRequest request);
    Task<bool> DeleteAsync(int id);
}
