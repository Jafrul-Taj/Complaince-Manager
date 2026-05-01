using System.ComponentModel.DataAnnotations;
using BankAudit.API.Enums;

namespace BankAudit.API.DTOs.Findings;

public class UpdateFindingRequest
{
    [Required] public string FindingArea { get; set; } = string.Empty;
    [Required] public string SlNo { get; set; } = string.Empty;
    [Required] public string FindingDetails { get; set; } = string.Empty;
    [Required] public RiskRating RiskRating { get; set; }
    public string NoOfInstances { get; set; } = string.Empty;
}
