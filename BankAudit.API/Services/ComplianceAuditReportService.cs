using BankAudit.API.Data;
using BankAudit.API.DTOs.ComplianceAuditReports;
using BankAudit.API.Entities;
using BankAudit.API.Enums;
using BankAudit.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Services;

public class ComplianceAuditReportService : IComplianceAuditReportService
{
    private readonly AppDbContext _db;

    public ComplianceAuditReportService(AppDbContext db) => _db = db;

    public async Task<List<ComplianceAuditReportDto>> GetAllAsync()
    {
        var reports = await _db.ComplianceAuditReports
            .Include(r => r.User)
            .Include(r => r.Branch)
            .Include(r => r.AuditTeamLead)
            .Include(r => r.Findings)
            .OrderByDescending(r => r.Year)
            .ThenBy(r => r.Branch.BranchName)
            .ToListAsync();

        return reports.Select(ToDto).ToList();
    }

    public async Task<List<ComplianceAuditReportDto>> GetMyReportsAsync(int officerId)
    {
        var reports = await _db.ComplianceAuditReports
            .Include(r => r.User)
            .Include(r => r.Branch)
            .Include(r => r.AuditTeamLead)
            .Include(r => r.Findings)
            .Where(r => r.UserId == officerId)
            .OrderByDescending(r => r.Year)
            .ThenBy(r => r.Branch.BranchName)
            .ToListAsync();

        return reports.Select(ToDto).ToList();
    }

    public async Task<List<ComplianceAuditReportDto>> GetByBranchAsync(int branchId)
    {
        var reports = await _db.ComplianceAuditReports
            .Include(r => r.User)
            .Include(r => r.Branch)
            .Include(r => r.AuditTeamLead)
            .Include(r => r.Findings)
            .Where(r => r.BranchId == branchId)
            .OrderByDescending(r => r.Year)
            .ToListAsync();

        return reports.Select(ToDto).ToList();
    }

    public async Task<ComplianceAuditReportDto?> GetByIdAsync(int id)
    {
        var report = await _db.ComplianceAuditReports
            .Include(r => r.User)
            .Include(r => r.Branch)
            .Include(r => r.AuditTeamLead)
            .Include(r => r.Findings)
            .FirstOrDefaultAsync(r => r.Id == id);

        return report is null ? null : ToDto(report);
    }

    public async Task<ComplianceAuditReportDto> CreateAsync(CreateComplianceAuditReportRequest request, int officerId)
    {
        var report = new ComplianceAuditReport
        {
            UserId = officerId,
            BranchId = request.BranchId,
            Year = request.Year,
            AuditTeamLeadId = request.AuditTeamLeadId,
            CreatedAt = DateTime.UtcNow
        };
        _db.ComplianceAuditReports.Add(report);
        await _db.SaveChangesAsync();

        await _db.Entry(report).Reference(r => r.User).LoadAsync();
        await _db.Entry(report).Reference(r => r.Branch).LoadAsync();
        await _db.Entry(report).Reference(r => r.AuditTeamLead).LoadAsync();

        return ToDto(report);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var report = await _db.ComplianceAuditReports.FindAsync(id);
        if (report is null) return false;
        _db.ComplianceAuditReports.Remove(report);
        await _db.SaveChangesAsync();
        return true;
    }

    private static ComplianceAuditReportDto ToDto(ComplianceAuditReport r) => new()
    {
        Id = r.Id,
        UserId = r.UserId,
        OfficerName = r.User?.FullName ?? string.Empty,
        BranchId = r.BranchId,
        BranchName = r.Branch?.BranchName ?? string.Empty,
        BranchCode = r.Branch?.BranchCode ?? string.Empty,
        Year = r.Year,
        AuditTeamLeadId = r.AuditTeamLeadId,
        AuditTeamLeadName = r.AuditTeamLead?.Name ?? string.Empty,
        AuditTeamLeadDesignation = r.AuditTeamLead?.Designation ?? string.Empty,
        TotalFindings = r.Findings.Count,
        PendingFindings = r.Findings.Count(f => f.RectificationStatus == RectificationStatus.Pending),
        RectifiedFindings = r.Findings.Count(f => f.RectificationStatus == RectificationStatus.Rectified),
        CreatedAt = r.CreatedAt
    };
}
