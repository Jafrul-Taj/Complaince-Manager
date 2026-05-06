namespace BankAudit.API.DTOs.Dashboard;

public class YearComparisonDto
{
    public int Year { get; set; }
    public int TotalFindings { get; set; }
    public int CriticalCount { get; set; }
    public int HighCount { get; set; }
    public int MediumCount { get; set; }
    public int LowCount { get; set; }
    public int RectifiedCount { get; set; }
    public double RectificationRate { get; set; }
}
