using BankAudit.API.Data;
using BankAudit.API.DTOs.Findings;
using BankAudit.API.Entities;
using BankAudit.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Services;

public class FindingService : IFindingService
{
    private readonly AppDbContext _db;

    public FindingService(AppDbContext db) => _db = db;

    public async Task<List<FindingDto>> GetAllAsync(int currentUserId, bool isOfficer, int? year, int? branchId, int? reportId)
    {
        var query = _db.AuditFindings
            .Include(f => f.Branch)
            .Include(f => f.AssignedOfficer)
            .Include(f => f.ComplianceAuditReport!)
                .ThenInclude(r => r.AuditTeamLead)
            .Include(f => f.ComplianceAuditReport!)
                .ThenInclude(r => r.User)
            .AsQueryable();

        if (isOfficer)
            query = query.Where(f => f.AssignedOfficerId == currentUserId);

        if (reportId.HasValue)
            query = query.Where(f => f.ComplianceAuditReportId == reportId.Value);

        if (year.HasValue)
            query = query.Where(f => f.Year == year.Value);

        if (branchId.HasValue)
            query = query.Where(f => f.BranchId == branchId.Value);

        var findings = await query.OrderByDescending(f => f.CreatedAt).ToListAsync();
        return findings.Select(ToDto).ToList();
    }

    public async Task<FindingDto?> GetByIdAsync(int id)
    {
        var finding = await _db.AuditFindings
            .Include(f => f.Branch)
            .Include(f => f.AssignedOfficer)
            .Include(f => f.ComplianceAuditReport!)
                .ThenInclude(r => r.AuditTeamLead)
            .Include(f => f.ComplianceAuditReport!)
                .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(f => f.Id == id);
        return finding is null ? null : ToDto(finding);
    }

    public async Task<FindingDto> CreateAsync(CreateFindingRequest request, int officerId)
    {
        var report = await _db.ComplianceAuditReports.FindAsync(request.ComplianceAuditReportId)
            ?? throw new InvalidOperationException("Compliance audit report not found.");

        var finding = new AuditFinding
        {
            ComplianceAuditReportId = report.Id,
            BranchId = report.BranchId,
            Year = report.Year,
            AssignedOfficerId = officerId,
            FindingArea = request.FindingArea,
            SlNo = request.SlNo,
            NameOfCustomers = request.NameOfCustomers,
            FindingDetails = request.FindingDetails,
            LapsesOriginated = request.LapsesOriginated,
            Category = request.Category,
            RiskRating = request.RiskRating,
            ComplianceStatus = request.ComplianceStatus,
            LapsesType = request.LapsesType,
            NoOfInstances = request.NoOfInstances,
            AuditBaseDate = request.AuditBaseDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.AuditFindings.Add(finding);
        await _db.SaveChangesAsync();

        return await GetByIdAsync(finding.Id) ?? ToDto(finding);
    }

    public async Task<FindingDto?> UpdateAsync(int id, UpdateFindingRequest request, int officerId)
    {
        var finding = await _db.AuditFindings
            .FirstOrDefaultAsync(f => f.Id == id && f.AssignedOfficerId == officerId);
        if (finding is null) return null;

        finding.FindingArea = request.FindingArea;
        finding.SlNo = request.SlNo;
        finding.NameOfCustomers = request.NameOfCustomers;
        finding.FindingDetails = request.FindingDetails;
        finding.LapsesOriginated = request.LapsesOriginated;
        finding.Category = request.Category;
        finding.RiskRating = request.RiskRating;
        finding.ComplianceStatus = request.ComplianceStatus;
        finding.LapsesType = request.LapsesType;
        finding.NoOfInstances = request.NoOfInstances;
        finding.AuditBaseDate = request.AuditBaseDate;
        finding.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<FindingDto?> RectifyAsync(int id, RectifyFindingRequest request, int officerId)
    {
        var finding = await _db.AuditFindings
            .FirstOrDefaultAsync(f => f.Id == id && f.AssignedOfficerId == officerId);
        if (finding is null) return null;

        finding.ComplianceStatus = request.ComplianceStatus;
        finding.RectificationRemarks = request.RectificationRemarks;
        finding.UpdatedAt = DateTime.UtcNow;

        if (request.ComplianceStatus == "Rectified")
            finding.RectifiedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var finding = await _db.AuditFindings.FindAsync(id);
        if (finding is null) return false;
        _db.AuditFindings.Remove(finding);
        await _db.SaveChangesAsync();
        return true;
    }

    private static FindingDto ToDto(AuditFinding f) => new()
    {
        Id = f.Id,
        ComplianceAuditReportId = f.ComplianceAuditReportId,
        BranchId = f.BranchId,
        BranchName = f.Branch?.BranchName ?? string.Empty,
        BranchCode = f.Branch?.BranchCode ?? string.Empty,
        AssignedOfficerId = f.AssignedOfficerId,
        OfficerName = f.AssignedOfficer?.FullName ?? string.Empty,
        AuditLeaderName = f.ComplianceAuditReport?.AuditTeamLead?.Name ?? string.Empty,
        ComplianceOfficerName = f.ComplianceAuditReport?.User?.FullName ?? string.Empty,
        FindingArea = f.FindingArea,
        SlNo = f.SlNo,
        NameOfCustomers = f.NameOfCustomers,
        FindingDetails = f.FindingDetails,
        LapsesOriginated = f.LapsesOriginated,
        Category = f.Category,
        RiskRating = f.RiskRating.ToString(),
        ComplianceStatus = f.ComplianceStatus,
        LapsesType = f.LapsesType,
        NoOfInstances = f.NoOfInstances,
        AuditBaseDate = f.AuditBaseDate,
        RectificationRemarks = f.RectificationRemarks,
        RectifiedAt = f.RectifiedAt,
        Year = f.Year,
        CreatedAt = f.CreatedAt,
        UpdatedAt = f.UpdatedAt
    };
}
