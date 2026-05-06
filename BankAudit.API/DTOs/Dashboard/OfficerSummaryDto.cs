namespace BankAudit.API.DTOs.Dashboard;

public class OfficerSummaryDto
{
    public int OfficerId { get; set; }
    public string OfficerName { get; set; } = string.Empty;
    public int TotalFindings { get; set; }
    public int HighCount { get; set; }
    public int MediumCount { get; set; }
    public int LowCount { get; set; }
    public int RectifiedCount { get; set; }
    public double RectificationRate { get; set; }
}
