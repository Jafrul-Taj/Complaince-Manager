using BankAudit.API.Data;
using BankAudit.API.DTOs.Dashboard;
using BankAudit.API.DTOs.Findings;
using BankAudit.API.Enums;
using BankAudit.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db) => _db = db;

    public async Task<KpiDto> GetKpisAsync(int year)
    {
        var findings = await _db.AuditFindings
            .Where(f => f.Year == year)
            .ToListAsync();

        var total = findings.Count;
        var rectified = findings.Count(f => f.RectificationStatus == RectificationStatus.Rectified);

        return new KpiDto
        {
            TotalFindings = total,
            CriticalCount = findings.Count(f => f.RiskRating == RiskRating.Critical),
            HighCount = findings.Count(f => f.RiskRating == RiskRating.High),
            RectifiedCount = rectified,
            PendingCount = findings.Count(f => f.RectificationStatus == RectificationStatus.Pending),
            InProgressCount = findings.Count(f => f.RectificationStatus == RectificationStatus.InProgress),
            RectificationRate = total > 0 ? Math.Round((double)rectified / total * 100, 1) : 0
        };
    }

    public async Task<List<RiskDistributionDto>> GetRiskDistributionAsync(int year)
    {
        return await _db.AuditFindings
            .Where(f => f.Year == year)
            .GroupBy(f => f.RiskRating)
            .Select(g => new RiskDistributionDto
            {
                RiskRating = g.Key.ToString(),
                Count = g.Count()
            })
            .ToListAsync();
    }

    public async Task<List<StatusBreakdownDto>> GetStatusBreakdownAsync(int year)
    {
        return await _db.AuditFindings
            .Where(f => f.Year == year)
            .GroupBy(f => f.RectificationStatus)
            .Select(g => new StatusBreakdownDto
            {
                Status = g.Key.ToString(),
                Count = g.Count()
            })
            .ToListAsync();
    }

    public async Task<List<BranchSummaryDto>> GetBranchSummaryAsync(int year)
    {
        return await _db.AuditFindings
            .Where(f => f.Year == year)
            .Include(f => f.Branch)
            .GroupBy(f => new { f.BranchId, f.Branch.BranchName })
            .Select(g => new BranchSummaryDto
            {
                BranchId = g.Key.BranchId,
                BranchName = g.Key.BranchName,
                TotalFindings = g.Count(),
                CriticalCount = g.Count(f => f.RiskRating == RiskRating.Critical),
                RectifiedCount = g.Count(f => f.RectificationStatus == RectificationStatus.Rectified),
                PendingCount = g.Count(f => f.RectificationStatus == RectificationStatus.Pending)
            })
            .OrderByDescending(b => b.TotalFindings)
            .ToListAsync();
    }

    public async Task<List<object>> GetMonthlyTrendAsync(int year)
    {
        var findings = await _db.AuditFindings
            .Where(f => f.Year == year)
            .GroupBy(f => f.CreatedAt.Month)
            .Select(g => new { Month = g.Key, Count = g.Count() })
            .ToListAsync();

        return Enumerable.Range(1, 12).Select(m => (object)new
        {
            Month = new DateTime(year, m, 1).ToString("MMM"),
            Count = findings.FirstOrDefault(f => f.Month == m)?.Count ?? 0
        }).ToList();
    }

    public async Task<List<FindingDto>> GetExportDataAsync(int year, int? branchId)
    {
        var query = _db.AuditFindings
            .Include(f => f.Branch)
            .Include(f => f.AssignedOfficer)
            .Where(f => f.Year == year);

        if (branchId.HasValue)
            query = query.Where(f => f.BranchId == branchId.Value);

        return await query
            .OrderBy(f => f.Branch.BranchName)
            .ThenBy(f => f.SlNo)
            .Select(f => new FindingDto
            {
                Id = f.Id,
                BranchId = f.BranchId,
                BranchName = f.Branch.BranchName,
                BranchCode = f.Branch.BranchCode,
                AssignedOfficerId = f.AssignedOfficerId,
                OfficerName = f.AssignedOfficer.FullName,
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
            })
            .ToListAsync();
    }
}
