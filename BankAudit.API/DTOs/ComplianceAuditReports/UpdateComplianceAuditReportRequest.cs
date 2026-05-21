using System.ComponentModel.DataAnnotations;

namespace BankAudit.API.DTOs.ComplianceAuditReports;

public class UpdateComplianceAuditReportRequest
{
    [Required] public string AuditTeamLeadId { get; set; } = string.Empty;
    [Required] public DateTime AuditBaseDate { get; set; }
}
