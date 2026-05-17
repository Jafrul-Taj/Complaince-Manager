namespace BankAudit.API.DTOs.Dashboard;

public class FindingDetailDto
{
    public int Id { get; set; }
    public string OfficerName { get; set; } = string.Empty;
    public int OfficerId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public string AuditLeaderName { get; set; } = string.Empty;
    public int Year { get; set; }
    public string NameOfCustomers { get; set; } = string.Empty;
    public string FindingDetails { get; set; } = string.Empty;
    public DateTime? AuditBaseDate { get; set; }
    public string LapsesOriginated { get; set; } = string.Empty;
    public string FindingArea { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string SlNo { get; set; } = string.Empty;
    public string RiskRating { get; set; } = string.Empty;
    public string LapsesType { get; set; } = string.Empty;
    public string NoOfInstances { get; set; } = string.Empty;
    public string ComplianceStatus { get; set; } = string.Empty;
    public DateTime? RectifiedAt { get; set; }
    public string RectificationRemarks { get; set; } = string.Empty;
}
