namespace BankAudit.API.DTOs.Assignments;

public class AssignmentSummaryDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public int TotalReports { get; set; }
}
