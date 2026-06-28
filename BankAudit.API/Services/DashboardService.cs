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
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(AppDbContext db, ILogger<DashboardService> logger)
    {
        _db = db;
        _logger = logger;
    }

    // ── Core query builder ──────────────────────────────────────────
    private IQueryable<AuditFinding> BuildQuery(
        int[]? years = null, int[]? branchIds = null, string[]? areas = null,
        string[]? riskRatings = null, int[]? officerIds = null,
        string[]? statuses = null, string[]? lapsesType = null)
    {
        var q = _db.AuditFindings
            .Include(f => f.ComplianceAuditReport)
            .AsQueryable();

        if (years != null && years.Length > 0)
            q = q.Where(f => years.Contains(f.Year));

        if (branchIds != null && branchIds.Length > 0)
            q = q.Where(f => branchIds.Contains(f.ComplianceAuditReport.BranchId));

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

        if (lapsesType != null && lapsesType.Length > 0)
            q = q.Where(f => lapsesType.Contains(f.LapsesType));

        return q;
    }

    // ── KPIs ────────────────────────────────────────────────────────
    public async Task<KpiDto> GetKpisAsync(
        int[]? years = null, int[]? branchIds = null, string[]? areas = null,
        string[]? riskRatings = null, int[]? officerIds = null,
        string[]? statuses = null, string[]? lapsesType = null)
    {
        try
        {
            _logger.LogInformation(
                "Retrieving KPIs — Years: {Years}, BranchIds: {BranchIds}, Areas: {Areas}",
                years, branchIds, areas);

            var findings = await BuildQuery(years, branchIds, areas, riskRatings, officerIds, statuses, lapsesType).ToListAsync();
            var total    = findings.Count;
            var rectified = findings.Count(f => f.ComplianceStatus == "Rectified");

            var kpi = new KpiDto
            {
                TotalFindings     = total,
                HighCount         = findings.Count(f => f.RiskRating == RiskRating.High),
                MediumCount       = findings.Count(f => f.RiskRating == RiskRating.Medium),
                LowCount          = findings.Count(f => f.RiskRating == RiskRating.Low),
                RectifiedCount    = rectified,
                RectificationRate = total > 0 ? Math.Round((double)rectified / total * 100, 1) : 0
            };

            _logger.LogInformation(
                "KPIs calculated — Total: {Total}, Rectified: {Rectified}, Rate: {Rate}%",
                kpi.TotalFindings, kpi.RectifiedCount, kpi.RectificationRate);

            return kpi;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving KPIs");
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    // ── Risk Distribution ────────────────────────────────────────────
    public async Task<List<RiskDistributionDto>> GetRiskDistributionAsync(
        int[]? years = null, int[]? branchIds = null, string[]? areas = null,
        int[]? officerIds = null, string[]? statuses = null, string[]? lapsesType = null)
    {
        try
        {
            _logger.LogInformation("Retrieving risk distribution");

            var findings = await BuildQuery(years, branchIds, areas, officerIds: officerIds, statuses: statuses, lapsesType: lapsesType).ToListAsync();
            var result = findings
                .GroupBy(f => f.RiskRating)
                .Select(g => new RiskDistributionDto { RiskRating = g.Key.ToString(), Count = g.Count() })
                .ToList();

            _logger.LogInformation("Retrieved risk distribution with {Count} categories", result.Count);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving risk distribution");
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    // ── Branch Summary (single method, join-based) ──────────────────
    public async Task<List<BranchSummaryDto>> GetBranchSummaryAsync(
        int[]? years = null, int[]? branchIds = null, string[]? areas = null,
        string[]? riskRatings = null, int[]? officerIds = null,
        string[]? statuses = null, string[]? lapsesType = null)
    {
        try
        {
            _logger.LogInformation(
                "Retrieving branch summary — Years: {Years}, BranchIds: {BranchIds}",
                years, branchIds);

            var query = from af in _db.AuditFindings
                        join car in _db.ComplianceAuditReports on af.ComplianceAuditReportId equals car.Id
                        join b in _db.Branches on car.BranchId equals b.Id
                        select new { AuditFinding = af, Branch = b };

            if (years != null && years.Length > 0)
                query = query.Where(x => years.Contains(x.AuditFinding.Year));

            if (branchIds != null && branchIds.Length > 0)
                query = query.Where(x => branchIds.Contains(x.Branch.Id));

            if (areas != null && areas.Length > 0)
                query = query.Where(x => areas.Contains(x.AuditFinding.FindingArea));

            if (riskRatings != null && riskRatings.Length > 0)
            {
                var parsed = riskRatings
                    .Select(r => Enum.TryParse<RiskRating>(r, true, out var v) ? (RiskRating?)v : null)
                    .Where(r => r.HasValue).Select(r => r!.Value).ToArray();
                if (parsed.Length > 0)
                    query = query.Where(x => parsed.Contains(x.AuditFinding.RiskRating));
            }

            if (officerIds != null && officerIds.Length > 0)
                query = query.Where(x => officerIds.Contains(x.AuditFinding.AssignedOfficerId));

            if (statuses != null && statuses.Length > 0)
                query = query.Where(x => statuses.Contains(x.AuditFinding.ComplianceStatus));

            if (lapsesType != null && lapsesType.Length > 0)
                query = query.Where(x => lapsesType.Contains(x.AuditFinding.LapsesType));

            var result = await query
                .GroupBy(x => new { x.Branch.Id, x.Branch.BranchName, BranchCode = x.Branch.BranchCode ?? "" })
                .Select(g => new BranchSummaryDto
                {
                    BranchId          = g.Key.Id,
                    BranchName        = g.Key.BranchName,
                    BranchCode        = g.Key.BranchCode,
                    TotalFindings     = g.Count(),
                    HighCount         = g.Count(x => x.AuditFinding.RiskRating == RiskRating.High),
                    MediumCount       = g.Count(x => x.AuditFinding.RiskRating == RiskRating.Medium),
                    LowCount          = g.Count(x => x.AuditFinding.RiskRating == RiskRating.Low),
                    RectifiedCount    = g.Count(x => x.AuditFinding.ComplianceStatus == "Rectified"),
                    RectificationRate = g.Count() > 0
                        ? Math.Round((double)g.Count(x => x.AuditFinding.ComplianceStatus == "Rectified") / g.Count() * 100, 1)
                        : 0
                })
                .OrderByDescending(x => x.TotalFindings)
                .ToListAsync();

            _logger.LogInformation("Retrieved branch summary with {Count} branches", result.Count);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving branch summary");
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    // ── Area Breakdown ───────────────────────────────────────────────
    public async Task<List<AreaBreakdownDto>> GetAreaBreakdownAsync(
        int[]? years = null, int[]? branchIds = null,
        int[]? officerIds = null, string[]? statuses = null, string[]? lapsesType = null)
    {
        try
        {
            _logger.LogInformation("Retrieving area breakdown");

            var findings = await BuildQuery(years, branchIds, officerIds: officerIds, statuses: statuses, lapsesType: lapsesType).ToListAsync();
            var result = findings
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

            _logger.LogInformation("Retrieved area breakdown with {Count} areas", result.Count);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving area breakdown");
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    // ── Category Breakdown ───────────────────────────────────────────
    public async Task<List<CategoryBreakdownDto>> GetCategoryBreakdownAsync(
        int[]? years = null, int[]? branchIds = null, string[]? areas = null,
        string[]? riskRatings = null, int top = int.MaxValue,
        int[]? officerIds = null, string[]? statuses = null, string[]? lapsesType = null)
    {
        try
        {
            _logger.LogInformation("Retrieving category breakdown — Top: {Top}", top == int.MaxValue ? "all" : top.ToString());

            var findings = await BuildQuery(years, branchIds, areas, riskRatings, officerIds, statuses, lapsesType).ToListAsync();
            var result = findings
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
                        BranchCount       = g.Select(f => f.BranchId).Distinct().Count(),
                        RectificationRate = total > 0 ? Math.Round((double)rect / total * 100, 1) : 0
                    };
                })
                .OrderByDescending(c => c.Count)
                .ToList();

            _logger.LogInformation("Retrieved category breakdown with {Count} categories", result.Count);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving category breakdown");
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    // ── Officer Summary ──────────────────────────────────────────────
    public async Task<List<OfficerSummaryDto>> GetOfficerSummaryAsync(
        int[]? years = null, int[]? branchIds = null, string[]? areas = null,
        string[]? statuses = null, int[]? officerIds = null, string[]? lapsesType = null)
    {
        try
        {
            _logger.LogInformation("Retrieving officer summary");

            var findings = await BuildQuery(years, branchIds, areas, officerIds: officerIds, statuses: statuses, lapsesType: lapsesType)
                .Include(f => f.AssignedOfficer)
                .ToListAsync();

            var result = findings
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

            _logger.LogInformation("Retrieved officer summary for {Count} officers", result.Count);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving officer summary");
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    // ── Year Comparison ──────────────────────────────────────────────
    public async Task<List<YearComparisonDto>> GetYearComparisonAsync(
        int[]? branchIds = null, string[]? areas = null,
        int[]? officerIds = null, string[]? statuses = null, string[]? lapsesType = null)
    {
        try
        {
            _logger.LogInformation("Retrieving year comparison");

            var findings = await BuildQuery(branchIds: branchIds, areas: areas, officerIds: officerIds, statuses: statuses, lapsesType: lapsesType).ToListAsync();
            var result = findings
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

            _logger.LogInformation("Retrieved year comparison spanning {Count} years", result.Count);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving year comparison");
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    // ── Officer list (for filter dropdown) ──────────────────────────
    public async Task<List<OfficerSummaryDto>> GetOfficerListAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving active officer list");

            var officers = await _db.Users
                .Where(u => u.Role == UserRole.ComplianceOfficer && u.IsActive)
                .Select(u => new OfficerSummaryDto { OfficerId = u.Id, OfficerName = u.FullName })
                .OrderBy(o => o.OfficerName)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} active officers", officers.Count);
            return officers;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving officer list");
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    // ── Findings by Filter (dashboard drilldown) ─────────────────────
    public async Task<List<FindingDetailDto>> GetFindingsByFilterAsync(
        int[]? years = null, int[]? branchIds = null, string[]? areas = null,
        string[]? riskRatings = null, int[]? officerIds = null,
        string[]? statuses = null, string[]? lapsesType = null,
        string? focusType = null, int? focusId = null, string? focusValue = null)
    {
        try
        {
            _logger.LogInformation(
                "Retrieving findings by filter — FocusType: {FocusType}, FocusId: {FocusId}, FocusValue: {FocusValue}",
                focusType, focusId, focusValue);

            IQueryable<AuditFinding> query = BuildQuery(years, branchIds, areas, riskRatings, officerIds, statuses, lapsesType)
                .Include(f => f.Branch)
                .Include(f => f.AssignedOfficer)
                .Include(f => f.ComplianceAuditReport!)
                    .ThenInclude(r => r.AuditTeamLead);

            if (focusType == "branch" && focusId.HasValue)
                query = query.Where(f => f.BranchId == focusId.Value);
            else if (focusType == "officer" && focusId.HasValue)
                query = query.Where(f => f.AssignedOfficerId == focusId.Value);
            else if (focusType == "year" && focusId.HasValue)
                query = query.Where(f => f.Year == focusId.Value);
            else if (focusType == "area" && focusValue != null)
                query = query.Where(f => f.FindingArea == focusValue);
            else if (focusType == "category" && focusValue != null)
                query = query.Where(f => f.Category == focusValue);

            var findings = await query
                .OrderBy(f => f.Branch.BranchName)
                .ThenBy(f => f.SlNo)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} findings for filter drilldown", findings.Count);

            return findings.Select(f => new FindingDetailDto
            {
                Id                   = f.Id,
                OfficerName          = f.AssignedOfficer?.FullName ?? "",
                OfficerId            = f.AssignedOfficerId,
                BranchName           = f.Branch?.BranchName ?? "",
                BranchCode           = f.Branch?.BranchCode ?? "",
                AuditLeaderName      = f.ComplianceAuditReport?.AuditTeamLead?.Name ?? "",
                Year                 = f.Year,
                NameOfCustomers      = f.NameOfCustomers,
                FindingDetails       = f.FindingDetails,
                AuditBaseDate        = f.ComplianceAuditReport?.AuditBaseDate,
                LapsesOriginated     = f.LapsesOriginated,
                FindingArea          = f.FindingArea,
                Category             = f.Category,
                SlNo                 = f.SlNo,
                RiskRating           = f.RiskRating.ToString(),
                LapsesType           = f.LapsesType,
                NoOfInstances        = f.NoOfInstances,
                ComplianceStatus     = f.ComplianceStatus,
                RectifiedAt          = f.RectifiedAt,
                RectificationRemarks = f.RectificationRemarks ?? ""
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving findings by filter");
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    // ── Export ───────────────────────────────────────────────────────
    public async Task<List<FindingDto>> GetExportDataAsync(
        int[]? years = null, int[]? branchIds = null, string[]? areas = null,
        string[]? riskRatings = null, string[]? statuses = null, string[]? lapsesType = null)
    {
        try
        {
            _logger.LogInformation(
                "Retrieving export data — Years: {Years}, BranchIds: {BranchIds}, Statuses: {Statuses}",
                years, branchIds, statuses);

            var query = BuildQuery(years, branchIds, areas, riskRatings, statuses: statuses, lapsesType: lapsesType)
                .Include(f => f.Branch)
                .Include(f => f.AssignedOfficer)
                .Include(f => f.ComplianceAuditReport!)
                .ThenInclude(r => r.AuditTeamLead);

            var findings = await query.OrderBy(f => f.Branch.BranchName).ThenBy(f => f.SlNo).ToListAsync();

            _logger.LogInformation("Export data retrieved — {Count} findings", findings.Count);

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
                AuditLeaderName      = f.ComplianceAuditReport?.AuditTeamLead?.Name ?? "",
                RiskRating           = f.RiskRating.ToString(),
                ComplianceStatus     = f.ComplianceStatus,
                LapsesType           = f.LapsesType,
                NoOfInstances        = f.NoOfInstances,
                AuditBaseDate        = f.ComplianceAuditReport?.AuditBaseDate,
                RectificationRemarks = f.RectificationRemarks,
                RectifiedAt          = f.RectifiedAt,
                Year                 = f.Year,
                CreatedAt            = f.CreatedAt,
                UpdatedAt            = f.UpdatedAt
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving export data");
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }
}
