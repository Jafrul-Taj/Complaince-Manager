using BankAudit.API.Data;
using BankAudit.API.DTOs.Branches;
using BankAudit.API.Entities;
using BankAudit.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Services;

public class BranchService : IBranchService
{
    private readonly AppDbContext _db;
    private readonly ILogger<BranchService> _logger;

    public BranchService(AppDbContext db, ILogger<BranchService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<BranchDto>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all {Entity}s", nameof(Branch));

            var branches = await _db.Branches
                .OrderBy(b => b.BranchName)
                .Select(b => ToDto(b))
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} {Entity}s", branches.Count, nameof(Branch));
            return branches;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all {Entity}s", nameof(Branch));
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<BranchDto?> GetByIdAsync(int id)
    {
        try
        {
            _logger.LogInformation("Retrieving {Entity} with ID {BranchId}", nameof(Branch), id);

            var branch = await _db.Branches.FindAsync(id);
            if (branch is null)
            {
                _logger.LogWarning("{Entity} with ID {BranchId} not found", nameof(Branch), id);
                return null;
            }

            return ToDto(branch);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving {Entity} with ID {BranchId}", nameof(Branch), id);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<BranchDto> CreateAsync(CreateBranchRequest request)
    {
        try
        {
            _logger.LogInformation(
                "Creating {Entity} — Name: {BranchName}, Code: {BranchCode}",
                nameof(Branch), request.BranchName, request.BranchCode);

            var branch = new Branch
            {
                BranchName = request.BranchName,
                BranchCode = request.BranchCode.ToUpper(),
                IsActive = true
            };
            _db.Branches.Add(branch);
            await _db.SaveChangesAsync();

            _logger.LogInformation("{Entity} created with ID {BranchId}", nameof(Branch), branch.Id);
            return ToDto(branch);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating {Entity} with Name: {BranchName}", nameof(Branch), request.BranchName);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    public async Task<BranchDto?> UpdateAsync(int id, UpdateBranchRequest request)
    {
        try
        {
            _logger.LogInformation("Updating {Entity} with ID {BranchId}", nameof(Branch), id);

            var branch = await _db.Branches.FindAsync(id);
            if (branch is null)
            {
                _logger.LogWarning("{Entity} with ID {BranchId} not found", nameof(Branch), id);
                return null;
            }

            branch.BranchName = request.BranchName;
            branch.IsActive = request.IsActive;

            await _db.SaveChangesAsync();

            _logger.LogInformation("{Entity} with ID {BranchId} updated successfully", nameof(Branch), id);
            return ToDto(branch);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating {Entity} with ID {BranchId}", nameof(Branch), id);
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
            _logger.LogInformation("Deleting {Entity} with ID {BranchId}", nameof(Branch), id);

            var branch = await _db.Branches.FindAsync(id);
            if (branch is null)
            {
                _logger.LogWarning("{Entity} with ID {BranchId} not found for deletion", nameof(Branch), id);
                return false;
            }

            _db.Branches.Remove(branch);
            await _db.SaveChangesAsync();

            _logger.LogInformation("{Entity} with ID {BranchId} deleted successfully", nameof(Branch), id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting {Entity} with ID {BranchId}", nameof(Branch), id);
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _logger.LogError(ex, "Inner exception: {Message}", ex.Message);
            }
            throw;
        }
    }

    private static BranchDto ToDto(Branch b) => new()
    {
        Id = b.Id,
        BranchName = b.BranchName,
        BranchCode = b.BranchCode,
        IsActive = b.IsActive
    };
}
