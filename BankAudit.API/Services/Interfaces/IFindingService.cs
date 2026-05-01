using BankAudit.API.DTOs.Findings;

namespace BankAudit.API.Services.Interfaces;

public interface IFindingService
{
    Task<List<FindingDto>> GetAllAsync(int currentUserId, bool isOfficer, int? year, int? branchId, int? reportId);
    Task<FindingDto?> GetByIdAsync(int id);
    Task<FindingDto> CreateAsync(CreateFindingRequest request, int officerId);
    Task<FindingDto?> UpdateAsync(int id, UpdateFindingRequest request, int officerId);
    Task<FindingDto?> RectifyAsync(int id, RectifyFindingRequest request, int officerId);
    Task<bool> DeleteAsync(int id);
}
