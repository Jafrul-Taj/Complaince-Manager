using BankAudit.API.DTOs.Branches;

namespace BankAudit.API.Services.Interfaces;

public interface IBranchService
{
    Task<List<BranchDto>> GetAllAsync();
    Task<BranchDto?> GetByIdAsync(int id);
    Task<BranchDto> CreateAsync(CreateBranchRequest request);
    Task<BranchDto?> UpdateAsync(int id, UpdateBranchRequest request);
    Task<bool> DeleteAsync(int id);
}
