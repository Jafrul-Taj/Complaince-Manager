using BankAudit.API.DTOs.Dashboard;
using BankAudit.API.DTOs.Findings;

namespace BankAudit.API.Services.Interfaces;

public interface IDashboardService
{
    Task<KpiDto> GetKpisAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, string[]? riskRatings = null, int[]? officerIds = null, string[]? statuses = null, string[]? lapsesType = null);
    Task<List<RiskDistributionDto>> GetRiskDistributionAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, int[]? officerIds = null, string[]? statuses = null, string[]? lapsesType = null);
    Task<List<BranchSummaryDto>> GetBranchSummaryAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, string[]? riskRatings = null, int[]? officerIds = null, string[]? statuses = null, string[]? lapsesType = null);
    Task<List<AreaBreakdownDto>> GetAreaBreakdownAsync(int[]? years = null, int[]? branchIds = null, int[]? officerIds = null, string[]? statuses = null, string[]? lapsesType = null);
    Task<List<CategoryBreakdownDto>> GetCategoryBreakdownAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, string[]? riskRatings = null, int top = 50, int[]? officerIds = null, string[]? statuses = null, string[]? lapsesType = null);
    Task<List<OfficerSummaryDto>> GetOfficerSummaryAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, string[]? statuses = null, int[]? officerIds = null, string[]? lapsesType = null);
    Task<List<YearComparisonDto>> GetYearComparisonAsync(int[]? branchIds = null, string[]? areas = null, int[]? officerIds = null, string[]? statuses = null, string[]? lapsesType = null);
    Task<List<OfficerSummaryDto>> GetOfficerListAsync();
    Task<List<FindingDto>> GetExportDataAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, string[]? riskRatings = null, string[]? statuses = null, string[]? lapsesType = null);
    Task<List<FindingDetailDto>> GetFindingsByFilterAsync(int[]? years = null, int[]? branchIds = null, string[]? areas = null, string[]? riskRatings = null, int[]? officerIds = null, string[]? statuses = null, string[]? lapsesType = null, string? focusType = null, int? focusId = null, string? focusValue = null);
}
