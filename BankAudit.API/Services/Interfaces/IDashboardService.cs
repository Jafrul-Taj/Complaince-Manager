using BankAudit.API.DTOs.Dashboard;
using BankAudit.API.DTOs.Findings;

namespace BankAudit.API.Services.Interfaces;

public interface IDashboardService
{
    Task<KpiDto> GetKpisAsync(int year);
    Task<List<RiskDistributionDto>> GetRiskDistributionAsync(int year);
    Task<List<StatusBreakdownDto>> GetStatusBreakdownAsync(int year);
    Task<List<BranchSummaryDto>> GetBranchSummaryAsync(int year);
    Task<List<object>> GetMonthlyTrendAsync(int year);
    Task<List<FindingDto>> GetExportDataAsync(int year, int? branchId);
}
