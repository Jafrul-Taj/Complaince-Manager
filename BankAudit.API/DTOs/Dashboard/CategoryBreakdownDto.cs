namespace BankAudit.API.DTOs.Dashboard;

public class CategoryBreakdownDto
{
    public string Category { get; set; } = string.Empty;
    public int Count { get; set; }
    public int RectifiedCount { get; set; }
    public int PendingCount { get; set; }
    public double RectificationRate { get; set; }
}
