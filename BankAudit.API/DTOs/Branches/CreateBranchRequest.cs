using System.ComponentModel.DataAnnotations;

namespace BankAudit.API.DTOs.Branches;

public class CreateBranchRequest
{
    [Required] public string BranchName { get; set; } = string.Empty;
    [Required] public string BranchCode { get; set; } = string.Empty;
}
