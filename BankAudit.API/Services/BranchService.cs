using BankAudit.API.Data;
using BankAudit.API.DTOs.Branches;
using BankAudit.API.Entities;
using BankAudit.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Services;

public class BranchService : IBranchService
{
    private readonly AppDbContext _db;

    public BranchService(AppDbContext db) => _db = db;

    public async Task<List<BranchDto>> GetAllAsync()
    {
        return await _db.Branches
            .OrderBy(b => b.BranchName)
            .Select(b => ToDto(b))
            .ToListAsync();
    }

    public async Task<BranchDto?> GetByIdAsync(int id)
    {
        var branch = await _db.Branches.FindAsync(id);
        return branch is null ? null : ToDto(branch);
    }

    public async Task<BranchDto> CreateAsync(CreateBranchRequest request)
    {
        var branch = new Branch
        {
            BranchName = request.BranchName,
            BranchCode = request.BranchCode.ToUpper(),
            IsActive = true
        };
        _db.Branches.Add(branch);
        await _db.SaveChangesAsync();
        return ToDto(branch);
    }

    public async Task<BranchDto?> UpdateAsync(int id, UpdateBranchRequest request)
    {
        var branch = await _db.Branches.FindAsync(id);
        if (branch is null) return null;

        branch.BranchName = request.BranchName;
        branch.IsActive = request.IsActive;

        await _db.SaveChangesAsync();
        return ToDto(branch);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var branch = await _db.Branches.FindAsync(id);
        if (branch is null) return false;
        _db.Branches.Remove(branch);
        await _db.SaveChangesAsync();
        return true;
    }

    private static BranchDto ToDto(Branch b) => new()
    {
        Id = b.Id,
        BranchName = b.BranchName,
        BranchCode = b.BranchCode,
        IsActive = b.IsActive
    };
}
