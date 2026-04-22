namespace BankAudit.API.DTOs.Dashboard;

public class KpiDto
{
    public int TotalFindings { get; set; }
    public int CriticalCount { get; set; }
    public int HighCount { get; set; }
    public int RectifiedCount { get; set; }
    public int PendingCount { get; set; }
    public int InProgressCount { get; set; }
    public double RectificationRate { get; set; }
}
