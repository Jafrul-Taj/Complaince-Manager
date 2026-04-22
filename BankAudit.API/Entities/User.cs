using BankAudit.API.Enums;

namespace BankAudit.API.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserBranchAssignment> Assignments { get; set; } = new List<UserBranchAssignment>();
    public ICollection<AuditFinding> Findings { get; set; } = new List<AuditFinding>();
}
