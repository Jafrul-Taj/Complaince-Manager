using BankAudit.API.DTOs.Assignments;

namespace BankAudit.API.Services.Interfaces;

public interface IAssignmentService
{
    Task<List<AssignmentDto>> GetAllAsync();
    Task<List<AssignmentDto>> GetByUserAsync(int userId);
    Task<List<AssignmentSummaryDto>> GetMyAssignmentSummaryAsync(int officerId);
    Task<AssignmentDto> CreateAsync(AssignBranchRequest request);
    Task<AssignmentDto?> UpdateAsync(int id, AssignBranchRequest request);
    Task<bool> DeleteAsync(int id);
}
