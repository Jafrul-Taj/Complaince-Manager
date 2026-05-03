namespace BankAudit.API.DTOs.Findings;

public class FindingDto
{
    public int Id { get; set; }
    public int? ComplianceAuditReportId { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public int AssignedOfficerId { get; set; }
    public string OfficerName { get; set; } = string.Empty;
    public string FindingArea { get; set; } = string.Empty;
    public string SlNo { get; set; } = string.Empty;
    public string NameOfCustomers { get; set; } = string.Empty;
    public string FindingDetails { get; set; } = string.Empty;
    public string LapsesOriginated { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string RiskRating { get; set; } = string.Empty;
    public string ComplianceStatus { get; set; } = string.Empty;
    public string LapsesType { get; set; } = string.Empty;
    public string NoOfInstances { get; set; } = string.Empty;
    public DateTime? AuditBaseDate { get; set; }
    public string? RectificationRemarks { get; set; }
    public DateTime? RectifiedAt { get; set; }
    public int Year { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
