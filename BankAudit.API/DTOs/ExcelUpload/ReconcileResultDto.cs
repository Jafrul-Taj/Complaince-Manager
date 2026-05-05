namespace BankAudit.API.DTOs.ExcelUpload;

public class ReconcileResultDto
{
    public int AssignmentsCreated { get; set; }
    public int ReportsCreated { get; set; }
    public int FindingsCreated { get; set; }
    public int RowsReconciled { get; set; }
    public List<string> Errors { get; set; } = [];
}
