namespace BankAudit.API.DTOs.Assignments;

public class AssignmentSummaryDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public int Year { get; set; }
    public int TotalFindings { get; set; }
    public int PendingFindings { get; set; }
    public int InProgressFindings { get; set; }
    public int RectifiedFindings { get; set; }
}
