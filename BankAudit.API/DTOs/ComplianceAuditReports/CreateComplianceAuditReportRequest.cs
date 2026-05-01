using System.ComponentModel.DataAnnotations;

namespace BankAudit.API.DTOs.ComplianceAuditReports;

public class CreateComplianceAuditReportRequest
{
    [Required] public int BranchId { get; set; }
    [Required, Range(2000, 2100)] public int Year { get; set; }
    [Required] public string AuditTeamLeadId { get; set; } = string.Empty;
}
