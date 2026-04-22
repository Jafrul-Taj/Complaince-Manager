using System.ComponentModel.DataAnnotations;
using BankAudit.API.Enums;

namespace BankAudit.API.DTOs.Findings;

public class UpdateFindingRequest
{
    [Required] public int BranchId { get; set; }
    [Required] public string FindingArea { get; set; } = string.Empty;
    [Required] public string SlNo { get; set; } = string.Empty;
    [Required] public string FindingDetails { get; set; } = string.Empty;
    [Required] public RiskRating RiskRating { get; set; }
    public string NoOfInstances { get; set; } = string.Empty;
    [Required, Range(2000, 2100)] public int Year { get; set; }
}
