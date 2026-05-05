namespace BankAudit.API.Entities;

public class ExcelFileData
{
    public int Id { get; set; }
    public string ComplianceOfficerName { get; set; } = string.Empty;
    public string BranchName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public string AuditTeamLeader { get; set; } = string.Empty;
    public string SlNo { get; set; } = string.Empty;
    public string NameOfCustomer { get; set; } = string.Empty;
    public string DetailsOfIrregularities { get; set; } = string.Empty;
    public string AuditBaseDate { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    public string LapsesOriginated { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string RiskRating { get; set; } = string.Empty;
    public string LapsesType { get; set; } = string.Empty;
    public string NoOfInstances { get; set; } = string.Empty;
    public string ComplianceStatus { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public int UploadedById { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public bool IsReconciled { get; set; }

    public User UploadedBy { get; set; } = null!;
}
