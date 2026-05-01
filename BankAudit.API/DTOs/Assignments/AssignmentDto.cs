namespace BankAudit.API.DTOs.Assignments;

public class AssignmentDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
}
