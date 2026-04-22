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

    public async Task<List<FindingDto>> GetAllAsync(int currentUserId, bool isOfficer, int? year, int? branchId)
    {
        var query = _db.AuditFindings
            .Include(f => f.Branch)
            .Include(f => f.AssignedOfficer)
            .AsQueryable();

        if (isOfficer)
            query = query.Where(f => f.AssignedOfficerId == currentUserId);

        if (year.HasValue)
            query = query.Where(f => f.Year == year.Value);

        if (branchId.HasValue)
            query = query.Where(f => f.BranchId == branchId.Value);

        return await query
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => ToDto(f))
            .ToListAsync();
    }

    public async Task<FindingDto?> GetByIdAsync(int id)
    {
        var finding = await _db.AuditFindings
            .Include(f => f.Branch)
            .Include(f => f.AssignedOfficer)
            .FirstOrDefaultAsync(f => f.Id == id);
        return finding is null ? null : ToDto(finding);
    }

    public async Task<FindingDto> CreateAsync(CreateFindingRequest request, int officerId)
    {
        var finding = new AuditFinding
        {
            BranchId = request.BranchId,
            AssignedOfficerId = officerId,
            FindingArea = request.FindingArea,
            SlNo = request.SlNo,
            FindingDetails = request.FindingDetails,
            RiskRating = request.RiskRating,
            NoOfInstances = request.NoOfInstances,
            Year = request.Year,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.AuditFindings.Add(finding);
        await _db.SaveChangesAsync();

        await _db.Entry(finding).Reference(f => f.Branch).LoadAsync();
        await _db.Entry(finding).Reference(f => f.AssignedOfficer).LoadAsync();

        return ToDto(finding);
    }

    public async Task<FindingDto?> UpdateAsync(int id, UpdateFindingRequest request, int officerId)
    {
        var finding = await _db.AuditFindings
            .Include(f => f.Branch)
            .Include(f => f.AssignedOfficer)
            .FirstOrDefaultAsync(f => f.Id == id && f.AssignedOfficerId == officerId);
        if (finding is null) return null;

        finding.BranchId = request.BranchId;
        finding.FindingArea = request.FindingArea;
        finding.SlNo = request.SlNo;
        finding.FindingDetails = request.FindingDetails;
        finding.RiskRating = request.RiskRating;
        finding.NoOfInstances = request.NoOfInstances;
        finding.Year = request.Year;
        finding.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _db.Entry(finding).Reference(f => f.Branch).LoadAsync();
        return ToDto(finding);
    }

    public async Task<FindingDto?> RectifyAsync(int id, RectifyFindingRequest request, int officerId)
    {
        var finding = await _db.AuditFindings
            .Include(f => f.Branch)
            .Include(f => f.AssignedOfficer)
            .FirstOrDefaultAsync(f => f.Id == id && f.AssignedOfficerId == officerId);
        if (finding is null) return null;

        finding.RectificationStatus = request.RectificationStatus;
        finding.RectificationRemarks = request.RectificationRemarks;
        finding.UpdatedAt = DateTime.UtcNow;

        if (request.RectificationStatus == Enums.RectificationStatus.Rectified)
            finding.RectifiedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return ToDto(finding);
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
        BranchId = f.BranchId,
        BranchName = f.Branch?.BranchName ?? string.Empty,
        BranchCode = f.Branch?.BranchCode ?? string.Empty,
        AssignedOfficerId = f.AssignedOfficerId,
        OfficerName = f.AssignedOfficer?.FullName ?? string.Empty,
        FindingArea = f.FindingArea,
        SlNo = f.SlNo,
        FindingDetails = f.FindingDetails,
        RiskRating = f.RiskRating.ToString(),
        NoOfInstances = f.NoOfInstances,
        RectificationStatus = f.RectificationStatus.ToString(),
        RectificationRemarks = f.RectificationRemarks,
        RectifiedAt = f.RectifiedAt,
        Year = f.Year,
        CreatedAt = f.CreatedAt,
        UpdatedAt = f.UpdatedAt
    };
}
