namespace BankAudit.API.DTOs.ComplianceAuditReports;

public class ComplianceAuditReportDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string OfficerName { get; set; } = string.Empty;
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public int Year { get; set; }
    public string AuditTeamLeadId { get; set; } = string.Empty;
    public string AuditTeamLeadName { get; set; } = string.Empty;
    public string AuditTeamLeadDesignation { get; set; } = string.Empty;
    public int TotalFindings { get; set; }
    public int PendingFindings { get; set; }
    public int RectifiedFindings { get; set; }
    public DateTime CreatedAt { get; set; }
}
