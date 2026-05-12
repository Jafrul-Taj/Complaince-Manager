using BankAudit.API.DTOs.Dashboard;
using BankAudit.API.DTOs.Findings;

namespace BankAudit.API.Services.Interfaces;

public interface IDashboardService
{
    Task<KpiDto> GetKpisAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, string[]? riskRatings = null, int[]? officerIds = null, string[]? statuses = null);
    Task<List<RiskDistributionDto>> GetRiskDistributionAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, string[]? statuses = null);
    Task<List<BranchSummaryDto>> GetBranchSummaryAsync(int[]? years = null, string[]? areas = null, string[]? statuses = null);
    Task<List<AreaBreakdownDto>> GetAreaBreakdownAsync(int[]? years = null, int[]? branchIds = null, string[]? statuses = null);
    Task<List<CategoryBreakdownDto>> GetCategoryBreakdownAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, string[]? riskRatings = null, int top = 50, string[]? statuses = null);
    Task<List<OfficerSummaryDto>> GetOfficerSummaryAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, string[]? statuses = null);
    Task<List<YearComparisonDto>> GetYearComparisonAsync(int[]? branchIds = null, string[]? areas = null);
    Task<List<OfficerSummaryDto>> GetOfficerListAsync();
    Task<List<FindingDto>> GetExportDataAsync(int[]? years = null, int[]? branchIds = null);
}
