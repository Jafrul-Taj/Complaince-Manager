namespace BankAudit.API.Entities;

public class ComplianceAuditReport
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int BranchId { get; set; }
    public int Year { get; set; }
    public string AuditTeamLeadId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public ICCDEmployee AuditTeamLead { get; set; } = null!;
    public ICollection<AuditFinding> Findings { get; set; } = new List<AuditFinding>();
}
