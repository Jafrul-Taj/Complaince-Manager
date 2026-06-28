using BankAudit.API.Data;
using BankAudit.API.DTOs.Findings;
using BankAudit.API.Entities;
using BankAudit.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Services;

public class FindingService : IFindingService
{
    private readonly AppDbContext _db;
    private readonly ILogger<FindingService> _logger;

    public FindingService(AppDbContext db, ILogger<FindingService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<FindingDto>> GetAllAsync(int currentUserId, bool isOfficer, int? year, int? branchId, int? reportId)
    {
        try
        {
            _logger.LogInformation(
                "Retrieving findings — UserId: {UserId}, IsOfficer: {IsOfficer}, Year: {Year}, BranchId: {BranchId}, ReportId: {ReportId}",
                currentUserId, isOfficer, year, branchId, reportId);

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

            _logger.LogInformation("Retrieved {Count} findings for UserId: {UserId}", findings.Count, currentUserId);

            return findings.Select(ToDto).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving findings for UserId: {UserId}", currentUserId);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<FindingDto?> GetByIdAsync(int id)
    {
        try
        {
            _logger.LogInformation("Retrieving {Entity} with ID {FindingId}", nameof(AuditFinding), id);

            var finding = await _db.AuditFindings
                .Include(f => f.Branch)
                .Include(f => f.AssignedOfficer)
                .Include(f => f.ComplianceAuditReport!)
                    .ThenInclude(r => r.AuditTeamLead)
                .Include(f => f.ComplianceAuditReport!)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (finding is null)
            {
                _logger.LogWarning("{Entity} with ID {FindingId} not found", nameof(AuditFinding), id);
                return null;
            }

            return ToDto(finding);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving {Entity} with ID {FindingId}", nameof(AuditFinding), id);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<FindingDto> CreateAsync(CreateFindingRequest request, int officerId)
    {
        try
        {
            _logger.LogInformation(
                "Creating {Entity} for ReportId: {ReportId}, OfficerId: {OfficerId}",
                nameof(AuditFinding), request.ComplianceAuditReportId, officerId);

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
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.AuditFindings.Add(finding);
            await _db.SaveChangesAsync();

            _logger.LogInformation("{Entity} created with ID {FindingId}", nameof(AuditFinding), finding.Id);

            return await GetByIdAsync(finding.Id) ?? ToDto(finding);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating {Entity} for OfficerId: {OfficerId}", nameof(AuditFinding), officerId);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<FindingDto?> UpdateAsync(int id, UpdateFindingRequest request, int officerId)
    {
        try
        {
            _logger.LogInformation(
                "Updating {Entity} with ID {FindingId} by OfficerId: {OfficerId}",
                nameof(AuditFinding), id, officerId);

            var finding = await _db.AuditFindings
                .FirstOrDefaultAsync(f => f.Id == id && f.AssignedOfficerId == officerId);

            if (finding is null)
            {
                _logger.LogWarning(
                    "{Entity} with ID {FindingId} not found for OfficerId: {OfficerId}",
                    nameof(AuditFinding), id, officerId);
                return null;
            }

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
            finding.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            _logger.LogInformation("{Entity} with ID {FindingId} updated successfully", nameof(AuditFinding), id);

            return await GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating {Entity} with ID {FindingId}", nameof(AuditFinding), id);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            return null;
        }
    }

    public async Task<FindingDto?> RectifyAsync(int id, RectifyFindingRequest request, int officerId)
    {
        try
        {
            _logger.LogInformation(
                "Rectifying {Entity} with ID {FindingId} by OfficerId: {OfficerId}, Status: {Status}",
                nameof(AuditFinding), id, officerId, request.ComplianceStatus);

            var finding = await _db.AuditFindings
                .FirstOrDefaultAsync(f => f.Id == id && f.AssignedOfficerId == officerId);

            if (finding is null)
            {
                _logger.LogWarning(
                    "{Entity} with ID {FindingId} not found for OfficerId: {OfficerId}",
                    nameof(AuditFinding), id, officerId);
                return null;
            }

            finding.ComplianceStatus = request.ComplianceStatus;
            finding.RectificationRemarks = request.RectificationRemarks;
            finding.UpdatedAt = DateTime.UtcNow;

            if (request.ComplianceStatus == "Rectified")
                finding.RectifiedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "{Entity} with ID {FindingId} rectified successfully with status '{Status}'",
                nameof(AuditFinding), id, request.ComplianceStatus);

            return await GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rectifying {Entity} with ID {FindingId}", nameof(AuditFinding), id);
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
            _logger.LogInformation("Deleting {Entity} with ID {FindingId}", nameof(AuditFinding), id);

            var finding = await _db.AuditFindings.FindAsync(id);
            if (finding is null)
            {
                _logger.LogWarning("{Entity} with ID {FindingId} not found for deletion", nameof(AuditFinding), id);
                return false;
            }

            _db.AuditFindings.Remove(finding);
            await _db.SaveChangesAsync();

            _logger.LogInformation("{Entity} with ID {FindingId} deleted successfully", nameof(AuditFinding), id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting {Entity} with ID {FindingId}", nameof(AuditFinding), id);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
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
        AuditBaseDate = f.ComplianceAuditReport?.AuditBaseDate,
        RectificationRemarks = f.RectificationRemarks,
        RectifiedAt = f.RectifiedAt,
        Year = f.Year,
        CreatedAt = f.CreatedAt,
        UpdatedAt = f.UpdatedAt
    };
}
