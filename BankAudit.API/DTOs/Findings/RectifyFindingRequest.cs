using System.ComponentModel.DataAnnotations;

namespace BankAudit.API.DTOs.Findings;

public class RectifyFindingRequest
{
    [Required] public string ComplianceStatus { get; set; } = string.Empty;
    [Required] public string RectificationRemarks { get; set; } = string.Empty;
}
