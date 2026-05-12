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
        int[]? years = null, int[]? branchIds = null, string[]? areas = null,
        string[]? riskRatings = null, int[]? officerIds = null, string[]? statuses = null)
    {
        var q = _db.AuditFindings.AsQueryable();

        if (years != null && years.Length > 0)
            q = q.Where(f => years.Contains(f.Year));

        if (branchIds != null && branchIds.Length > 0)
            q = q.Where(f => branchIds.Contains(f.BranchId));

        if (areas != null && areas.Length > 0)
            q = q.Where(f => areas.Contains(f.FindingArea));

        if (riskRatings != null && riskRatings.Length > 0)
        {
            var parsed = riskRatings
                .Select(r => Enum.TryParse<RiskRating>(r, true, out var v) ? (RiskRating?)v : null)
                .Where(r => r.HasValue).Select(r => r!.Value).ToArray();
            if (parsed.Length > 0)
                q = q.Where(f => parsed.Contains(f.RiskRating));
        }

        if (officerIds != null && officerIds.Length > 0)
            q = q.Where(f => officerIds.Contains(f.AssignedOfficerId));

        if (statuses != null && statuses.Length > 0)
            q = q.Where(f => statuses.Contains(f.ComplianceStatus));

        return q;
    }

    public async Task<KpiDto> GetKpisAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, string[]? riskRatings = null, int[]? officerIds = null, string[]? statuses = null)
    {
        var findings = await BuildQuery(years, branchIds, areas, riskRatings, officerIds, statuses).ToListAsync();
        var total    = findings.Count;
        var rectified = findings.Count(f => f.ComplianceStatus == "Rectified");
        return new KpiDto
        {
            TotalFindings     = total,
            HighCount         = findings.Count(f => f.RiskRating == RiskRating.High),
            MediumCount       = findings.Count(f => f.RiskRating == RiskRating.Medium),
            LowCount          = findings.Count(f => f.RiskRating == RiskRating.Low),
            RectifiedCount    = rectified,
            RectificationRate = total > 0 ? Math.Round((double)rectified / total * 100, 1) : 0
        };
    }

    public async Task<List<RiskDistributionDto>> GetRiskDistributionAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, string[]? statuses = null)
    {
        var findings = await BuildQuery(years, branchIds, areas, statuses: statuses).ToListAsync();
        return findings
            .GroupBy(f => f.RiskRating)
            .Select(g => new RiskDistributionDto { RiskRating = g.Key.ToString(), Count = g.Count() })
            .ToList();
    }

    public async Task<List<BranchSummaryDto>> GetBranchSummaryAsync(int[]? years = null, string[]? areas = null, string[]? statuses = null)
    {
        var findings = await BuildQuery(years, areas: areas, statuses: statuses)
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
                    HighCount         = g.Count(f => f.RiskRating == RiskRating.High),
                    MediumCount       = g.Count(f => f.RiskRating == RiskRating.Medium),
                    LowCount          = g.Count(f => f.RiskRating == RiskRating.Low),
                    RectifiedCount    = rect,
                    RectificationRate = total > 0 ? Math.Round((double)rect / total * 100, 1) : 0
                };
            })
            .OrderByDescending(b => b.TotalFindings)
            .ToList();
    }

    public async Task<List<AreaBreakdownDto>> GetAreaBreakdownAsync(int[]? years = null, int[]? branchIds = null, string[]? statuses = null)
    {
        var findings = await BuildQuery(years, branchIds, statuses: statuses).ToListAsync();
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
                    HighCount         = g.Count(f => f.RiskRating == RiskRating.High),
                    MediumCount       = g.Count(f => f.RiskRating == RiskRating.Medium),
                    LowCount          = g.Count(f => f.RiskRating == RiskRating.Low),
                    RectifiedCount    = rect,
                    RectificationRate = total > 0 ? Math.Round((double)rect / total * 100, 1) : 0
                };
            })
            .OrderByDescending(a => a.TotalFindings)
            .ToList();
    }

    public async Task<List<CategoryBreakdownDto>> GetCategoryBreakdownAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, string[]? riskRatings = null, int top = 50, string[]? statuses = null)
    {
        var findings = await BuildQuery(years, branchIds, areas, riskRatings, statuses: statuses).ToListAsync();
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
                    RectificationRate = total > 0 ? Math.Round((double)rect / total * 100, 1) : 0
                };
            })
            .OrderByDescending(c => c.Count)
            .Take(top)
            .ToList();
    }

    public async Task<List<OfficerSummaryDto>> GetOfficerSummaryAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, string[]? statuses = null)
    {
        var findings = await BuildQuery(years, branchIds, areas, statuses: statuses)
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

    public async Task<List<YearComparisonDto>> GetYearComparisonAsync(int[]? branchIds = null, string[]? areas = null)
    {
        var findings = await BuildQuery(branchIds: branchIds, areas: areas).ToListAsync();
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

    public async Task<List<FindingDto>> GetExportDataAsync(int[]? years = null, int[]? branchIds = null)
    {
        var query = BuildQuery(years, branchIds)
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
