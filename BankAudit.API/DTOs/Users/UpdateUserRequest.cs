using System.ComponentModel.DataAnnotations;

namespace BankAudit.API.DTOs.Users;

public class UpdateUserRequest
{
    [Required] public string FullName { get; set; } = string.Empty;
    [EmailAddress] public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string? NewPassword { get; set; }
}
