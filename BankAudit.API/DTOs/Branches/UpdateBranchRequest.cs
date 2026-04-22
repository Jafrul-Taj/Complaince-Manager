using System.ComponentModel.DataAnnotations;

namespace BankAudit.API.DTOs.Branches;

public class UpdateBranchRequest
{
    [Required] public string BranchName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
