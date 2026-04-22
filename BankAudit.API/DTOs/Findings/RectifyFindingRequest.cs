using System.ComponentModel.DataAnnotations;
using BankAudit.API.Enums;

namespace BankAudit.API.DTOs.Findings;

public class RectifyFindingRequest
{
    [Required] public RectificationStatus RectificationStatus { get; set; }
    [Required] public string RectificationRemarks { get; set; } = string.Empty;
}
