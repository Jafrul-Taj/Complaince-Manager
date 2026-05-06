namespace BankAudit.API.DTOs.Dashboard;

public class RecentFindingDto
{
    public int Id { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string FindingArea { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string RiskRating { get; set; } = string.Empty;
    public string ComplianceStatus { get; set; } = string.Empty;
    public string SlNo { get; set; } = string.Empty;
    public DateTime? AuditBaseDate { get; set; }
    public int Year { get; set; }
}
