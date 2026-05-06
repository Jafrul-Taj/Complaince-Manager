namespace BankAudit.API.DTOs.Dashboard;

public class BranchSummaryDto
{
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public int TotalFindings { get; set; }
    public int CriticalCount { get; set; }
    public int HighCount { get; set; }
    public int MediumCount { get; set; }
    public int LowCount { get; set; }
    public int RectifiedCount { get; set; }
    public int PendingCount { get; set; }
    public double RectificationRate { get; set; }
}
