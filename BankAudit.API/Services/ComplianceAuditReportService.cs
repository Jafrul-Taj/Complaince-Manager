using BankAudit.API.Data;
using BankAudit.API.DTOs.ComplianceAuditReports;
using BankAudit.API.Entities;
using BankAudit.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Services;

public class ComplianceAuditReportService : IComplianceAuditReportService
{
    private readonly AppDbContext _db;
    private readonly ILogger<ComplianceAuditReportService> _logger;

    public ComplianceAuditReportService(AppDbContext db, ILogger<ComplianceAuditReportService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<ComplianceAuditReportDto>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all {Entity}s", nameof(ComplianceAuditReport));

            var reports = await _db.ComplianceAuditReports
                .Include(r => r.User)
                .Include(r => r.Branch)
                .Include(r => r.AuditTeamLead)
                .Include(r => r.Findings)
                .OrderByDescending(r => r.Year)
                .ThenBy(r => r.Branch.BranchName)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} {Entity}s", reports.Count, nameof(ComplianceAuditReport));
            return reports.Select(ToDto).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all {Entity}s", nameof(ComplianceAuditReport));
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<List<ComplianceAuditReportDto>> GetMyReportsAsync(int officerId)
    {
        try
        {
            _logger.LogInformation(
                "Retrieving {Entity}s for OfficerId: {OfficerId}",
                nameof(ComplianceAuditReport), officerId);

            var reports = await _db.ComplianceAuditReports
                .Include(r => r.User)
                .Include(r => r.Branch)
                .Include(r => r.AuditTeamLead)
                .Include(r => r.Findings)
                .Where(r => r.UserId == officerId)
                .OrderByDescending(r => r.Year)
                .ThenBy(r => r.Branch.BranchName)
                .ToListAsync();

            _logger.LogInformation(
                "Retrieved {Count} {Entity}s for OfficerId: {OfficerId}",
                reports.Count, nameof(ComplianceAuditReport), officerId);

            return reports.Select(ToDto).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving {Entity}s for OfficerId: {OfficerId}", nameof(ComplianceAuditReport), officerId);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<List<ComplianceAuditReportDto>> GetByBranchAsync(int branchId)
    {
        try
        {
            _logger.LogInformation(
                "Retrieving {Entity}s for BranchId: {BranchId}",
                nameof(ComplianceAuditReport), branchId);

            var reports = await _db.ComplianceAuditReports
                .Include(r => r.User)
                .Include(r => r.Branch)
                .Include(r => r.AuditTeamLead)
                .Include(r => r.Findings)
                .Where(r => r.BranchId == branchId)
                .OrderByDescending(r => r.Year)
                .ToListAsync();

            _logger.LogInformation(
                "Retrieved {Count} {Entity}s for BranchId: {BranchId}",
                reports.Count, nameof(ComplianceAuditReport), branchId);

            return reports.Select(ToDto).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving {Entity}s for BranchId: {BranchId}", nameof(ComplianceAuditReport), branchId);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<ComplianceAuditReportDto?> GetByIdAsync(int id)
    {
        try
        {
            _logger.LogInformation("Retrieving {Entity} with ID {ReportId}", nameof(ComplianceAuditReport), id);

            var report = await _db.ComplianceAuditReports
                .Include(r => r.User)
                .Include(r => r.Branch)
                .Include(r => r.AuditTeamLead)
                .Include(r => r.Findings)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (report is null)
            {
                _logger.LogWarning("{Entity} with ID {ReportId} not found", nameof(ComplianceAuditReport), id);
                return null;
            }

            return ToDto(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving {Entity} with ID {ReportId}", nameof(ComplianceAuditReport), id);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<ComplianceAuditReportDto> CreateAsync(CreateComplianceAuditReportRequest request, int officerId)
    {
        try
        {
            _logger.LogInformation(
                "Creating {Entity} — OfficerId: {OfficerId}, BranchId: {BranchId}, Year: {Year}",
                nameof(ComplianceAuditReport), officerId, request.BranchId, request.Year);

            var report = new ComplianceAuditReport
            {
                UserId = officerId,
                BranchId = request.BranchId,
                Year = request.Year,
                AuditTeamLeadId = request.AuditTeamLeadId,
                AuditBaseDate = request.AuditBaseDate,
                CreatedAt = DateTime.UtcNow
            };
            _db.ComplianceAuditReports.Add(report);
            await _db.SaveChangesAsync();

            await _db.Entry(report).Reference(r => r.User).LoadAsync();
            await _db.Entry(report).Reference(r => r.Branch).LoadAsync();
            await _db.Entry(report).Reference(r => r.AuditTeamLead).LoadAsync();

            _logger.LogInformation("{Entity} created with ID {ReportId}", nameof(ComplianceAuditReport), report.Id);
            return ToDto(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating {Entity} for OfficerId: {OfficerId}", nameof(ComplianceAuditReport), officerId);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<ComplianceAuditReportDto?> UpdateAsync(int id, UpdateComplianceAuditReportRequest request)
    {
        try
        {
            _logger.LogInformation("Updating {Entity} with ID {ReportId}", nameof(ComplianceAuditReport), id);

            var report = await _db.ComplianceAuditReports.FindAsync(id);
            if (report is null)
            {
                _logger.LogWarning("{Entity} with ID {ReportId} not found", nameof(ComplianceAuditReport), id);
                return null;
            }

            report.AuditTeamLeadId = request.AuditTeamLeadId;
            report.AuditBaseDate   = request.AuditBaseDate;

            await _db.SaveChangesAsync();

            _logger.LogInformation("{Entity} with ID {ReportId} updated successfully", nameof(ComplianceAuditReport), id);
            return await GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating {Entity} with ID {ReportId}", nameof(ComplianceAuditReport), id);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            _logger.LogInformation("Deleting {Entity} with ID {ReportId}", nameof(ComplianceAuditReport), id);

            var report = await _db.ComplianceAuditReports.FindAsync(id);
            if (report is null)
            {
                _logger.LogWarning("{Entity} with ID {ReportId} not found for deletion", nameof(ComplianceAuditReport), id);
                return false;
            }

            _db.ComplianceAuditReports.Remove(report);
            await _db.SaveChangesAsync();

            _logger.LogInformation("{Entity} with ID {ReportId} deleted successfully", nameof(ComplianceAuditReport), id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting {Entity} with ID {ReportId}", nameof(ComplianceAuditReport), id);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
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
        PendingFindings = r.Findings.Count(f => f.ComplianceStatus == "Unrectified"),
        RectifiedFindings = r.Findings.Count(f => f.ComplianceStatus == "Rectified"),
        AuditBaseDate = r.AuditBaseDate,
        CreatedAt = r.CreatedAt
    };
}
