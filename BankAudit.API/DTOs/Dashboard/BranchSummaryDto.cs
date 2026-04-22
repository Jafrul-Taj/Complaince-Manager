namespace BankAudit.API.DTOs.Dashboard;

public class BranchSummaryDto
{
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int TotalFindings { get; set; }
    public int CriticalCount { get; set; }
    public int RectifiedCount { get; set; }
    public int PendingCount { get; set; }
}
