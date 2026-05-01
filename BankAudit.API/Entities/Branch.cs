namespace BankAudit.API.Entities;

public class Branch
{
    public int Id { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<UserBranchAssignment> Assignments { get; set; } = new List<UserBranchAssignment>();
    public ICollection<AuditFinding> Findings { get; set; } = new List<AuditFinding>();
    public ICollection<ComplianceAuditReport> ComplianceAuditReports { get; set; } = new List<ComplianceAuditReport>();
}
