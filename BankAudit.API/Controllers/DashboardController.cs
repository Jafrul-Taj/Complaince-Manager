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
        [FromQuery] int[]? years, [FromQuery] int[]? branchIds,
        [FromQuery] string[]? areas, [FromQuery] string[]? riskRatings,
        [FromQuery] int[]? officerIds, [FromQuery] string[]? statuses)
        => Ok(await _service.GetKpisAsync(years, branchIds, areas, riskRatings, officerIds, statuses));

    [HttpGet("risk-distribution")]
    public async Task<IActionResult> GetRiskDistribution(
        [FromQuery] int[]? years, [FromQuery] int[]? branchIds,
        [FromQuery] string[]? areas, [FromQuery] string[]? statuses)
        => Ok(await _service.GetRiskDistributionAsync(years, branchIds, areas, statuses));

    [HttpGet("branch-summary")]
    public async Task<IActionResult> GetBranchSummary(
        [FromQuery] int[]? years, [FromQuery] string[]? areas, [FromQuery] string[]? statuses)
        => Ok(await _service.GetBranchSummaryAsync(years, areas, statuses));

    [HttpGet("area-breakdown")]
    public async Task<IActionResult> GetAreaBreakdown(
        [FromQuery] int[]? years, [FromQuery] int[]? branchIds, [FromQuery] string[]? statuses)
        => Ok(await _service.GetAreaBreakdownAsync(years, branchIds, statuses));

    [HttpGet("category-breakdown")]
    public async Task<IActionResult> GetCategoryBreakdown(
        [FromQuery] int[]? years, [FromQuery] int[]? branchIds,
        [FromQuery] string[]? areas, [FromQuery] string[]? riskRatings,
        [FromQuery] int top = 50, [FromQuery] string[]? statuses = null)
        => Ok(await _service.GetCategoryBreakdownAsync(years, branchIds, areas, riskRatings, top, statuses));

    [HttpGet("officer-summary")]
    public async Task<IActionResult> GetOfficerSummary(
        [FromQuery] int[]? years, [FromQuery] int[]? branchIds,
        [FromQuery] string[]? areas, [FromQuery] string[]? statuses)
        => Ok(await _service.GetOfficerSummaryAsync(years, branchIds, areas, statuses));

    [HttpGet("year-comparison")]
    public async Task<IActionResult> GetYearComparison(
        [FromQuery] int[]? branchIds, [FromQuery] string[]? areas)
        => Ok(await _service.GetYearComparisonAsync(branchIds, areas));

    [HttpGet("officers")]
    public async Task<IActionResult> GetOfficers()
        => Ok(await _service.GetOfficerListAsync());

    [HttpGet("export")]
    public async Task<IActionResult> GetExportData(
        [FromQuery] int[]? years, [FromQuery] int[]? branchIds)
        => Ok(await _service.GetExportDataAsync(years, branchIds));
}
