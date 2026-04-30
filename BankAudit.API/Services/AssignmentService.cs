using BankAudit.API.Data;
using BankAudit.API.DTOs.Assignments;
using BankAudit.API.Entities;
using BankAudit.API.Enums;
using BankAudit.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Services;

public class AssignmentService : IAssignmentService
{
    private readonly AppDbContext _db;

    public AssignmentService(AppDbContext db) => _db = db;

    public async Task<List<AssignmentDto>> GetAllAsync()
    {
        return await _db.UserBranchAssignments
            .Include(a => a.User)
            .Include(a => a.Branch)
            .OrderBy(a => a.Year)
            .Select(a => ToDto(a))
            .ToListAsync();
    }

    public async Task<List<AssignmentDto>> GetByUserAsync(int userId)
    {
        return await _db.UserBranchAssignments
            .Include(a => a.User)
            .Include(a => a.Branch)
            .Where(a => a.UserId == userId)
            .Select(a => ToDto(a))
            .ToListAsync();
    }

    public async Task<List<AssignmentSummaryDto>> GetMyAssignmentSummaryAsync(int officerId)
    {
        var assignments = await _db.UserBranchAssignments
            .Include(a => a.Branch)
            .Where(a => a.UserId == officerId)
            .OrderByDescending(a => a.Year)
            .ThenBy(a => a.Branch.BranchName)
            .ToListAsync();

        var result = new List<AssignmentSummaryDto>();
        foreach (var a in assignments)
        {
            var findings = await _db.AuditFindings
                .Where(f => f.AssignedOfficerId == officerId && f.BranchId == a.BranchId && f.Year == a.Year)
                .ToListAsync();

            result.Add(new AssignmentSummaryDto
            {
                Id = a.Id,
                BranchId = a.BranchId,
                BranchName = a.Branch?.BranchName ?? string.Empty,
                BranchCode = a.Branch?.BranchCode ?? string.Empty,
                Year = a.Year,
                TotalFindings = findings.Count,
                PendingFindings = findings.Count(f => f.RectificationStatus == RectificationStatus.Pending),
                InProgressFindings = findings.Count(f => f.RectificationStatus == RectificationStatus.InProgress),
                RectifiedFindings = findings.Count(f => f.RectificationStatus == RectificationStatus.Rectified)
            });
        }
        return result;
    }

    public async Task<AssignmentDto> CreateAsync(AssignBranchRequest request)
    {
        var assignment = new UserBranchAssignment
        {
            UserId = request.UserId,
            BranchId = request.BranchId,
            Year = request.Year
        };
        _db.UserBranchAssignments.Add(assignment);
        await _db.SaveChangesAsync();

        await _db.Entry(assignment).Reference(a => a.User).LoadAsync();
        await _db.Entry(assignment).Reference(a => a.Branch).LoadAsync();

        return ToDto(assignment);
    }

    public async Task<AssignmentDto?> UpdateAsync(int id, AssignBranchRequest request)
    {
        var assignment = await _db.UserBranchAssignments.FindAsync(id);
        if (assignment is null) return null;

        assignment.UserId = request.UserId;
        assignment.BranchId = request.BranchId;
        assignment.Year = request.Year;

        await _db.SaveChangesAsync();
        await _db.Entry(assignment).Reference(a => a.User).LoadAsync();
        await _db.Entry(assignment).Reference(a => a.Branch).LoadAsync();

        return ToDto(assignment);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var assignment = await _db.UserBranchAssignments.FindAsync(id);
        if (assignment is null) return false;
        _db.UserBranchAssignments.Remove(assignment);
        await _db.SaveChangesAsync();
        return true;
    }

    private static AssignmentDto ToDto(UserBranchAssignment a) => new()
    {
        Id = a.Id,
        UserId = a.UserId,
        UserFullName = a.User?.FullName ?? string.Empty,
        BranchId = a.BranchId,
        BranchName = a.Branch?.BranchName ?? string.Empty,
        BranchCode = a.Branch?.BranchCode ?? string.Empty,
        Year = a.Year
    };
}
