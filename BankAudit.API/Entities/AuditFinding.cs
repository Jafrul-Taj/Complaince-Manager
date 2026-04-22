using BankAudit.API.Enums;

namespace BankAudit.API.Entities;

public class AuditFinding
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public int AssignedOfficerId { get; set; }
    public string FindingArea { get; set; } = string.Empty;
    public string SlNo { get; set; } = string.Empty;
    public string FindingDetails { get; set; } = string.Empty;
    public RiskRating RiskRating { get; set; }
    public string NoOfInstances { get; set; } = string.Empty;
    public RectificationStatus RectificationStatus { get; set; } = RectificationStatus.Pending;
    public string? RectificationRemarks { get; set; }
    public DateTime? RectifiedAt { get; set; }
    public int Year { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Branch Branch { get; set; } = null!;
    public User AssignedOfficer { get; set; } = null!;
}
