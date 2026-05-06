using BankAudit.API.Data;
using BankAudit.API.DTOs.Dashboard;
using BankAudit.API.DTOs.Findings;
using BankAudit.API.Entities;
using BankAudit.API.Enums;
using BankAudit.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db) => _db = db;

    private IQueryable<AuditFinding> BuildQuery(
        int? year, int? branchId = null, string? area = null,
        string? riskRating = null, int? officerId = null, string? complianceStatus = null)
    {
        var q = _db.AuditFindings.AsQueryable();
        if (year.HasValue && year.Value > 0)
            q = q.Where(f => f.Year == year.Value);
        if (branchId.HasValue)
            q = q.Where(f => f.BranchId == branchId.Value);
        if (!string.IsNullOrWhiteSpace(area))
            q = q.Where(f => f.FindingArea == area);
        if (!string.IsNullOrWhiteSpace(riskRating) &&
            Enum.TryParse<RiskRating>(riskRating, true, out var r))
            q = q.Where(f => f.RiskRating == r);
        if (officerId.HasValue)
            q = q.Where(f => f.AssignedOfficerId == officerId.Value);
        if (!string.IsNullOrWhiteSpace(complianceStatus))
            q = q.Where(f => f.ComplianceStatus == complianceStatus);
        return q;
    }

    public async Task<KpiDto> GetKpisAsync(int? year, int? branchId = null, string? area = null, string? riskRating = null, int? officerId = null, string? complianceStatus = null)
    {
        var findings = await BuildQuery(year, branchId, area, riskRating, officerId, complianceStatus).ToListAsync();
        var total = findings.Count;
        var rectified = findings.Count(f => f.ComplianceStatus == "Rectified");
        return new KpiDto
        {
            TotalFindings     = total,
            CriticalCount     = findings.Count(f => f.RiskRating == RiskRating.Critical),
            HighCount         = findings.Count(f => f.RiskRating == RiskRating.High),
            MediumCount       = findings.Count(f => f.RiskRating == RiskRating.Medium),
            LowCount          = findings.Count(f => f.RiskRating == RiskRating.Low),
            RectifiedCount    = rectified,
            PendingCount      = findings.Count(f => f.ComplianceStatus == "Unrectified"),
            RectificationRate = total > 0 ? Math.Round((double)rectified / total * 100, 1) : 0
        };
    }

    public async Task<List<RiskDistributionDto>> GetRiskDistributionAsync(int? year, int? branchId = null, string? area = null, string? complianceStatus = null)
    {
        var findings = await BuildQuery(year, branchId, area, complianceStatus: complianceStatus).ToListAsync();
        return findings
            .GroupBy(f => f.RiskRating)
            .Select(g => new RiskDistributionDto { RiskRating = g.Key.ToString(), Count = g.Count() })
            .ToList();
    }

    public async Task<List<StatusBreakdownDto>> GetStatusBreakdownAsync(int? year, int? branchId = null, string? area = null)
    {
        var findings = await BuildQuery(year, branchId, area).ToListAsync();
        return findings
            .GroupBy(f => f.ComplianceStatus)
            .Select(g => new StatusBreakdownDto { Status = g.Key, Count = g.Count() })
            .ToList();
    }

    public async Task<List<BranchSummaryDto>> GetBranchSummaryAsync(int? year, string? area = null, string? complianceStatus = null)
    {
        var findings = await BuildQuery(year, area: area, complianceStatus: complianceStatus)
            .Include(f => f.Branch)
            .ToListAsync();

        return findings
            .GroupBy(f => new { f.BranchId, BranchName = f.Branch?.BranchName ?? "", BranchCode = f.Branch?.BranchCode ?? "" })
            .Select(g =>
            {
                var total = g.Count();
                var rect  = g.Count(f => f.ComplianceStatus == "Rectified");
                return new BranchSummaryDto
                {
                    BranchId          = g.Key.BranchId,
                    BranchName        = g.Key.BranchName,
                    BranchCode        = g.Key.BranchCode,
                    TotalFindings     = total,
                    CriticalCount     = g.Count(f => f.RiskRating == RiskRating.Critical),
                    HighCount         = g.Count(f => f.RiskRating == RiskRating.High),
                    MediumCount       = g.Count(f => f.RiskRating == RiskRating.Medium),
                    LowCount          = g.Count(f => f.RiskRating == RiskRating.Low),
                    RectifiedCount    = rect,
                    PendingCount      = g.Count(f => f.ComplianceStatus == "Unrectified"),
                    RectificationRate = total > 0 ? Math.Round((double)rect / total * 100, 1) : 0
                };
            })
            .OrderByDescending(b => b.TotalFindings)
            .ToList();
    }

    public async Task<List<object>> GetMonthlyTrendAsync(int? year, int? branchId = null, string? area = null, string? complianceStatus = null)
    {
        var displayYear = year ?? DateTime.Now.Year;
        var findings = await BuildQuery(year, branchId, area, complianceStatus: complianceStatus)
            .Where(f => f.Year == displayYear)
            .GroupBy(f => f.CreatedAt.Month)
            .Select(g => new { Month = g.Key, Count = g.Count() })
            .ToListAsync();

        return Enumerable.Range(1, 12).Select(m => (object)new
        {
            Month = new DateTime(displayYear, m, 1).ToString("MMM"),
            Count = findings.FirstOrDefault(f => f.Month == m)?.Count ?? 0
        }).ToList();
    }

    public async Task<List<AreaBreakdownDto>> GetAreaBreakdownAsync(int? year, int? branchId = null, string? complianceStatus = null)
    {
        var findings = await BuildQuery(year, branchId, complianceStatus: complianceStatus).ToListAsync();
        return findings
            .GroupBy(f => f.FindingArea)
            .Select(g =>
            {
                var total = g.Count();
                var rect  = g.Count(f => f.ComplianceStatus == "Rectified");
                return new AreaBreakdownDto
                {
                    Area              = g.Key,
                    TotalFindings     = total,
                    CriticalCount     = g.Count(f => f.RiskRating == RiskRating.Critical),
                    HighCount         = g.Count(f => f.RiskRating == RiskRating.High),
                    MediumCount       = g.Count(f => f.RiskRating == RiskRating.Medium),
                    LowCount          = g.Count(f => f.RiskRating == RiskRating.Low),
                    RectifiedCount    = rect,
                    PendingCount      = g.Count(f => f.ComplianceStatus == "Unrectified"),
                    RectificationRate = total > 0 ? Math.Round((double)rect / total * 100, 1) : 0
                };
            })
            .OrderByDescending(a => a.TotalFindings)
            .ToList();
    }

    public async Task<List<CategoryBreakdownDto>> GetCategoryBreakdownAsync(int? year, int? branchId = null, string? area = null, string? riskRating = null, int top = 20, string? complianceStatus = null)
    {
        var findings = await BuildQuery(year, branchId, area, riskRating, complianceStatus: complianceStatus).ToListAsync();
        return findings
            .GroupBy(f => f.Category)
            .Select(g =>
            {
                var total = g.Count();
                var rect  = g.Count(f => f.ComplianceStatus == "Rectified");
                return new CategoryBreakdownDto
                {
                    Category          = g.Key,
                    Count             = total,
                    RectifiedCount    = rect,
                    PendingCount      = g.Count(f => f.ComplianceStatus == "Unrectified"),
                    RectificationRate = total > 0 ? Math.Round((double)rect / total * 100, 1) : 0
                };
            })
            .OrderByDescending(c => c.Count)
            .Take(top)
            .ToList();
    }

    public async Task<List<OfficerSummaryDto>> GetOfficerSummaryAsync(int? year, int? branchId = null, string? area = null, string? complianceStatus = null)
    {
        var findings = await BuildQuery(year, branchId, area, complianceStatus: complianceStatus)
            .Include(f => f.AssignedOfficer)
            .ToListAsync();

        return findings
            .GroupBy(f => new { f.AssignedOfficerId, Name = f.AssignedOfficer?.FullName ?? "" })
            .Select(g =>
            {
                var total = g.Count();
                var rect  = g.Count(f => f.ComplianceStatus == "Rectified");
                return new OfficerSummaryDto
                {
                    OfficerId         = g.Key.AssignedOfficerId,
                    OfficerName       = g.Key.Name,
                    TotalFindings     = total,
                    HighCount         = g.Count(f => f.RiskRating == RiskRating.High),
                    MediumCount       = g.Count(f => f.RiskRating == RiskRating.Medium),
                    LowCount          = g.Count(f => f.RiskRating == RiskRating.Low),
                    RectifiedCount    = rect,
                    RectificationRate = total > 0 ? Math.Round((double)rect / total * 100, 1) : 0
                };
            })
            .OrderByDescending(o => o.TotalFindings)
            .ToList();
    }

    public async Task<List<YearComparisonDto>> GetYearComparisonAsync(int? branchId = null, string? area = null)
    {
        var findings = await BuildQuery(null, branchId, area).ToListAsync();
        return findings
            .GroupBy(f => f.Year)
            .Select(g =>
            {
                var total = g.Count();
                var rect  = g.Count(f => f.ComplianceStatus == "Rectified");
                return new YearComparisonDto
                {
                    Year              = g.Key,
                    TotalFindings     = total,
                    CriticalCount     = g.Count(f => f.RiskRating == RiskRating.Critical),
                    HighCount         = g.Count(f => f.RiskRating == RiskRating.High),
                    MediumCount       = g.Count(f => f.RiskRating == RiskRating.Medium),
                    LowCount          = g.Count(f => f.RiskRating == RiskRating.Low),
                    RectifiedCount    = rect,
                    RectificationRate = total > 0 ? Math.Round((double)rect / total * 100, 1) : 0
                };
            })
            .OrderBy(y => y.Year)
            .ToList();
    }

    public async Task<List<RecentFindingDto>> GetRecentFindingsAsync(int? year, int? branchId = null, string? area = null, int count = 10)
    {
        return await BuildQuery(year, branchId, area)
            .Include(f => f.Branch)
            .OrderByDescending(f => f.CreatedAt)
            .Take(count)
            .Select(f => new RecentFindingDto
            {
                Id               = f.Id,
                BranchName       = f.Branch.BranchName,
                FindingArea      = f.FindingArea,
                Category         = f.Category,
                RiskRating       = f.RiskRating.ToString(),
                ComplianceStatus = f.ComplianceStatus,
                SlNo             = f.SlNo,
                AuditBaseDate    = f.AuditBaseDate,
                Year             = f.Year
            })
            .ToListAsync();
    }

    public async Task<List<OfficerSummaryDto>> GetOfficerListAsync()
    {
        return await _db.Users
            .Where(u => u.Role == UserRole.ComplianceOfficer && u.IsActive)
            .Select(u => new OfficerSummaryDto
            {
                OfficerId   = u.Id,
                OfficerName = u.FullName
            })
            .OrderBy(o => o.OfficerName)
            .ToListAsync();
    }

    public async Task<List<FindingDto>> GetExportDataAsync(int? year, int? branchId)
    {
        var query = BuildQuery(year, branchId)
            .Include(f => f.Branch)
            .Include(f => f.AssignedOfficer);

        var findings = await query.OrderBy(f => f.Branch.BranchName).ThenBy(f => f.SlNo).ToListAsync();
        return findings.Select(f => new FindingDto
        {
            Id                   = f.Id,
            BranchId             = f.BranchId,
            BranchName           = f.Branch?.BranchName ?? "",
            BranchCode           = f.Branch?.BranchCode ?? "",
            AssignedOfficerId    = f.AssignedOfficerId,
            OfficerName          = f.AssignedOfficer?.FullName ?? "",
            FindingArea          = f.FindingArea,
            SlNo                 = f.SlNo,
            NameOfCustomers      = f.NameOfCustomers,
            FindingDetails       = f.FindingDetails,
            LapsesOriginated     = f.LapsesOriginated,
            Category             = f.Category,
            RiskRating           = f.RiskRating.ToString(),
            ComplianceStatus     = f.ComplianceStatus,
            LapsesType           = f.LapsesType,
            NoOfInstances        = f.NoOfInstances,
            AuditBaseDate        = f.AuditBaseDate,
            RectificationRemarks = f.RectificationRemarks,
            RectifiedAt          = f.RectifiedAt,
            Year                 = f.Year,
            CreatedAt            = f.CreatedAt,
            UpdatedAt            = f.UpdatedAt
        }).ToList();
    }
}
