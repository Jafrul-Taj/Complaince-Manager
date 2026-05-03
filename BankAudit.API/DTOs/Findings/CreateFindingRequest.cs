using System.ComponentModel.DataAnnotations;
using BankAudit.API.Enums;

namespace BankAudit.API.DTOs.Findings;

public class CreateFindingRequest
{
    [Required] public int ComplianceAuditReportId { get; set; }
    [Required] public string FindingArea { get; set; } = string.Empty;
    [Required] public string SlNo { get; set; } = string.Empty;
    public string NameOfCustomers { get; set; } = string.Empty;
    [Required] public string FindingDetails { get; set; } = string.Empty;
    public string LapsesOriginated { get; set; } = string.Empty;
    [Required] public string Category { get; set; } = string.Empty;
    [Required] public RiskRating RiskRating { get; set; }
    [Required] public string ComplianceStatus { get; set; } = string.Empty;
    public string LapsesType { get; set; } = string.Empty;
    public string NoOfInstances { get; set; } = string.Empty;
    public DateTime? AuditBaseDate { get; set; }
}
