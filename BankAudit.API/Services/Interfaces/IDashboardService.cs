using BankAudit.API.DTOs.Dashboard;
using BankAudit.API.DTOs.Findings;

namespace BankAudit.API.Services.Interfaces;

public interface IDashboardService
{
    Task<KpiDto> GetKpisAsync(int? year, int? branchId = null, string? area = null, string? riskRating = null, int? officerId = null, string? complianceStatus = null);
    Task<List<RiskDistributionDto>> GetRiskDistributionAsync(int? year, int? branchId = null, string? area = null, string? complianceStatus = null);
    Task<List<StatusBreakdownDto>> GetStatusBreakdownAsync(int? year, int? branchId = null, string? area = null);
    Task<List<BranchSummaryDto>> GetBranchSummaryAsync(int? year, string? area = null, string? complianceStatus = null);
    Task<List<object>> GetMonthlyTrendAsync(int? year, int? branchId = null, string? area = null, string? complianceStatus = null);
    Task<List<AreaBreakdownDto>> GetAreaBreakdownAsync(int? year, int? branchId = null, string? complianceStatus = null);
    Task<List<CategoryBreakdownDto>> GetCategoryBreakdownAsync(int? year, int? branchId = null, string? area = null, string? riskRating = null, int top = 20, string? complianceStatus = null);
    Task<List<OfficerSummaryDto>> GetOfficerSummaryAsync(int? year, int? branchId = null, string? area = null, string? complianceStatus = null);
    Task<List<YearComparisonDto>> GetYearComparisonAsync(int? branchId = null, string? area = null);
    Task<List<RecentFindingDto>> GetRecentFindingsAsync(int? year, int? branchId = null, string? area = null, int count = 10);
    Task<List<OfficerSummaryDto>> GetOfficerListAsync();
    Task<List<FindingDto>> GetExportDataAsync(int? year, int? branchId);
}
