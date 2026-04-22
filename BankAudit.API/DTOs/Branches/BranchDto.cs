namespace BankAudit.API.DTOs.Branches;

public class BranchDto
{
    public int Id { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
