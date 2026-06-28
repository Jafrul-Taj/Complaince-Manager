using BankAudit.API.Data;
using BankAudit.API.DTOs.Assignments;
using BankAudit.API.Entities;
using BankAudit.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Services;

public class AssignmentService : IAssignmentService
{
    private readonly AppDbContext _db;
    private readonly ILogger<AssignmentService> _logger;

    public AssignmentService(AppDbContext db, ILogger<AssignmentService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<AssignmentDto>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all {Entity}s", nameof(UserBranchAssignment));

            var assignments = await _db.UserBranchAssignments
                .Include(a => a.User)
                .Include(a => a.Branch)
                .OrderBy(a => a.Branch.BranchName)
                .Select(a => ToDto(a))
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} {Entity}s", assignments.Count, nameof(UserBranchAssignment));
            return assignments;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all {Entity}s", nameof(UserBranchAssignment));
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<List<AssignmentDto>> GetByUserAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Retrieving {Entity}s for UserId: {UserId}", nameof(UserBranchAssignment), userId);

            var assignments = await _db.UserBranchAssignments
                .Include(a => a.User)
                .Include(a => a.Branch)
                .Where(a => a.UserId == userId)
                .Select(a => ToDto(a))
                .ToListAsync();

            _logger.LogInformation(
                "Retrieved {Count} {Entity}s for UserId: {UserId}",
                assignments.Count, nameof(UserBranchAssignment), userId);

            return assignments;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving {Entity}s for UserId: {UserId}", nameof(UserBranchAssignment), userId);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<List<AssignmentSummaryDto>> GetMyAssignmentSummaryAsync(int officerId)
    {
        try
        {
            _logger.LogInformation("Retrieving assignment summary for OfficerId: {OfficerId}", officerId);

            var assignments = await _db.UserBranchAssignments
                .Include(a => a.Branch)
                .Where(a => a.UserId == officerId)
                .OrderBy(a => a.Branch.BranchName)
                .ToListAsync();

            var result = new List<AssignmentSummaryDto>();
            foreach (var a in assignments)
            {
                var totalReports = await _db.ComplianceAuditReports
                    .CountAsync(r => r.BranchId == a.BranchId);

                result.Add(new AssignmentSummaryDto
                {
                    Id = a.Id,
                    BranchId = a.BranchId,
                    BranchName = a.Branch?.BranchName ?? string.Empty,
                    BranchCode = a.Branch?.BranchCode ?? string.Empty,
                    TotalReports = totalReports
                });
            }

            _logger.LogInformation(
                "Retrieved {Count} assignment summaries for OfficerId: {OfficerId}",
                result.Count, officerId);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving assignment summary for OfficerId: {OfficerId}", officerId);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<AssignmentDto> CreateAsync(AssignBranchRequest request)
    {
        try
        {
            _logger.LogInformation(
                "Creating {Entity} — UserId: {UserId}, BranchId: {BranchId}",
                nameof(UserBranchAssignment), request.UserId, request.BranchId);

            var assignment = new UserBranchAssignment
            {
                UserId = request.UserId,
                BranchId = request.BranchId
            };
            _db.UserBranchAssignments.Add(assignment);
            await _db.SaveChangesAsync();

            await _db.Entry(assignment).Reference(a => a.User).LoadAsync();
            await _db.Entry(assignment).Reference(a => a.Branch).LoadAsync();

            _logger.LogInformation("{Entity} created with ID {AssignmentId}", nameof(UserBranchAssignment), assignment.Id);
            return ToDto(assignment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating {Entity} for UserId: {UserId}", nameof(UserBranchAssignment), request.UserId);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<AssignmentDto?> UpdateAsync(int id, AssignBranchRequest request)
    {
        try
        {
            _logger.LogInformation("Updating {Entity} with ID {AssignmentId}", nameof(UserBranchAssignment), id);

            var assignment = await _db.UserBranchAssignments.FindAsync(id);
            if (assignment is null)
            {
                _logger.LogWarning("{Entity} with ID {AssignmentId} not found", nameof(UserBranchAssignment), id);
                return null;
            }

            assignment.UserId = request.UserId;
            assignment.BranchId = request.BranchId;

            await _db.SaveChangesAsync();
            await _db.Entry(assignment).Reference(a => a.User).LoadAsync();
            await _db.Entry(assignment).Reference(a => a.Branch).LoadAsync();

            _logger.LogInformation("{Entity} with ID {AssignmentId} updated successfully", nameof(UserBranchAssignment), id);
            return ToDto(assignment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating {Entity} with ID {AssignmentId}", nameof(UserBranchAssignment), id);
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
            _logger.LogInformation("Deleting {Entity} with ID {AssignmentId}", nameof(UserBranchAssignment), id);

            var assignment = await _db.UserBranchAssignments.FindAsync(id);
            if (assignment is null)
            {
                _logger.LogWarning("{Entity} with ID {AssignmentId} not found for deletion", nameof(UserBranchAssignment), id);
                return false;
            }

            _db.UserBranchAssignments.Remove(assignment);
            await _db.SaveChangesAsync();

            _logger.LogInformation("{Entity} with ID {AssignmentId} deleted successfully", nameof(UserBranchAssignment), id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting {Entity} with ID {AssignmentId}", nameof(UserBranchAssignment), id);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    private static AssignmentDto ToDto(UserBranchAssignment a) => new()
    {
        Id = a.Id,
        UserId = a.UserId,
        UserFullName = a.User?.FullName ?? string.Empty,
        BranchId = a.BranchId,
        BranchName = a.Branch?.BranchName ?? string.Empty,
        BranchCode = a.Branch?.BranchCode ?? string.Empty
    };
}
