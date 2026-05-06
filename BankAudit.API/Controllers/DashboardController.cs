using BankAudit.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BankAudit.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "ComplianceHead,Operator")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;
    public DashboardController(IDashboardService service) => _service = service;

    [HttpGet("kpis")]
    public async Task<IActionResult> GetKpis(
        [FromQuery] int? year, [FromQuery] int? branchId,
        [FromQuery] string? area, [FromQuery] string? riskRating,
        [FromQuery] int? officerId, [FromQuery] string? complianceStatus)
        => Ok(await _service.GetKpisAsync(year, branchId, area, riskRating, officerId, complianceStatus));

    [HttpGet("risk-distribution")]
    public async Task<IActionResult> GetRiskDistribution(
        [FromQuery] int? year, [FromQuery] int? branchId,
        [FromQuery] string? area, [FromQuery] string? complianceStatus)
        => Ok(await _service.GetRiskDistributionAsync(year, branchId, area, complianceStatus));

    [HttpGet("status-breakdown")]
    public async Task<IActionResult> GetStatusBreakdown(
        [FromQuery] int? year, [FromQuery] int? branchId, [FromQuery] string? area)
        => Ok(await _service.GetStatusBreakdownAsync(year, branchId, area));

    [HttpGet("branch-summary")]
    public async Task<IActionResult> GetBranchSummary(
        [FromQuery] int? year, [FromQuery] string? area, [FromQuery] string? complianceStatus)
        => Ok(await _service.GetBranchSummaryAsync(year, area, complianceStatus));

    [HttpGet("trend")]
    public async Task<IActionResult> GetMonthlyTrend(
        [FromQuery] int? year, [FromQuery] int? branchId,
        [FromQuery] string? area, [FromQuery] string? complianceStatus)
        => Ok(await _service.GetMonthlyTrendAsync(year, branchId, area, complianceStatus));

    [HttpGet("area-breakdown")]
    public async Task<IActionResult> GetAreaBreakdown(
        [FromQuery] int? year, [FromQuery] int? branchId, [FromQuery] string? complianceStatus)
        => Ok(await _service.GetAreaBreakdownAsync(year, branchId, complianceStatus));

    [HttpGet("category-breakdown")]
    public async Task<IActionResult> GetCategoryBreakdown(
        [FromQuery] int? year, [FromQuery] int? branchId,
        [FromQuery] string? area, [FromQuery] string? riskRating,
        [FromQuery] int top = 50, [FromQuery] string? complianceStatus = null)
        => Ok(await _service.GetCategoryBreakdownAsync(year, branchId, area, riskRating, top, complianceStatus));

    [HttpGet("officer-summary")]
    public async Task<IActionResult> GetOfficerSummary(
        [FromQuery] int? year, [FromQuery] int? branchId,
        [FromQuery] string? area, [FromQuery] string? complianceStatus)
        => Ok(await _service.GetOfficerSummaryAsync(year, branchId, area, complianceStatus));

    [HttpGet("year-comparison")]
    public async Task<IActionResult> GetYearComparison(
        [FromQuery] int? branchId, [FromQuery] string? area)
        => Ok(await _service.GetYearComparisonAsync(branchId, area));

    [HttpGet("recent-findings")]
    public async Task<IActionResult> GetRecentFindings(
        [FromQuery] int? year, [FromQuery] int? branchId,
        [FromQuery] string? area, [FromQuery] int count = 10)
        => Ok(await _service.GetRecentFindingsAsync(year, branchId, area, count));

    [HttpGet("officers")]
    public async Task<IActionResult> GetOfficers()
        => Ok(await _service.GetOfficerListAsync());

    [HttpGet("export")]
    public async Task<IActionResult> GetExportData(
        [FromQuery] int? year, [FromQuery] int? branchId)
        => Ok(await _service.GetExportDataAsync(year, branchId));
}
