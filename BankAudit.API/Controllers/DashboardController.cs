using BankAudit.API.DTOs.Dashboard;
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
        [FromQuery] int[]? officerIds, [FromQuery] string[]? statuses,
        [FromQuery] string[]? lapsesType)
        => Ok(await _service.GetKpisAsync(years, branchIds, areas, riskRatings, officerIds, statuses, lapsesType));

    [HttpGet("risk-distribution")]
    public async Task<IActionResult> GetRiskDistribution(
        [FromQuery] int[]? years, [FromQuery] int[]? branchIds,
        [FromQuery] string[]? areas, [FromQuery] int[]? officerIds,
        [FromQuery] string[]? statuses, [FromQuery] string[]? lapsesType)
        => Ok(await _service.GetRiskDistributionAsync(years, branchIds, areas, officerIds, statuses, lapsesType));

    [HttpGet("branch-summary")]
    public async Task<ActionResult<List<BranchSummaryDto>>> GetBranchSummary(
        [FromQuery] int[]? years, [FromQuery] int[]? branchIds,
        [FromQuery] string[]? areas, [FromQuery] string[]? riskRatings,
        [FromQuery] int[]? officerIds, [FromQuery] string[]? statuses,
        [FromQuery] string[]? lapsesType)
        => Ok(await _service.GetBranchSummaryAsync(years, branchIds, areas, riskRatings, officerIds, statuses, lapsesType));

    [HttpGet("area-breakdown")]
    public async Task<IActionResult> GetAreaBreakdown(
        [FromQuery] int[]? years, [FromQuery] int[]? branchIds,
        [FromQuery] int[]? officerIds, [FromQuery] string[]? statuses,
        [FromQuery] string[]? lapsesType)
        => Ok(await _service.GetAreaBreakdownAsync(years, branchIds, officerIds, statuses, lapsesType));

    [HttpGet("category-breakdown")]
    public async Task<IActionResult> GetCategoryBreakdown(
        [FromQuery] int[]? years, [FromQuery] int[]? branchIds,
        [FromQuery] string[]? areas, [FromQuery] string[]? riskRatings,
        [FromQuery] int top = 50, [FromQuery] int[]? officerIds = null,
        [FromQuery] string[]? statuses = null, [FromQuery] string[]? lapsesType = null)
        => Ok(await _service.GetCategoryBreakdownAsync(years, branchIds, areas, riskRatings, top, officerIds, statuses, lapsesType));

    [HttpGet("officer-summary")]
    public async Task<IActionResult> GetOfficerSummary(
        [FromQuery] int[]? years, [FromQuery] int[]? branchIds,
        [FromQuery] string[]? areas, [FromQuery] string[]? statuses,
        [FromQuery] int[]? officerIds, [FromQuery] string[]? lapsesType)
        => Ok(await _service.GetOfficerSummaryAsync(years, branchIds, areas, statuses, officerIds, lapsesType));

    [HttpGet("year-comparison")]
    public async Task<IActionResult> GetYearComparison(
        [FromQuery] int[]? branchIds, [FromQuery] string[]? areas,
        [FromQuery] int[]? officerIds, [FromQuery] string[]? statuses,
        [FromQuery] string[]? lapsesType)
        => Ok(await _service.GetYearComparisonAsync(branchIds, areas, officerIds, statuses, lapsesType));

    [HttpGet("officers")]
    public async Task<IActionResult> GetOfficers()
        => Ok(await _service.GetOfficerListAsync());

    [HttpGet("export")]
    public async Task<IActionResult> GetExportData(
        [FromQuery] int[]? years, [FromQuery] int[]? branchIds,
        [FromQuery] string[]? areas, [FromQuery] string[]? riskRatings,
        [FromQuery] string[]? statuses, [FromQuery] string[]? lapsesType)
        => Ok(await _service.GetExportDataAsync(years, branchIds, areas, riskRatings, statuses, lapsesType));

    [HttpGet("findings-by-filter")]
    public async Task<IActionResult> GetFindingsByFilter(
        [FromQuery] int[]? years, [FromQuery] int[]? branchIds,
        [FromQuery] string[]? areas, [FromQuery] string[]? riskRatings,
        [FromQuery] int[]? officerIds, [FromQuery] string[]? statuses,
        [FromQuery] string[]? lapsesType,
        [FromQuery] string? focusType, [FromQuery] int? focusId,
        [FromQuery] string? focusValue)
        => Ok(await _service.GetFindingsByFilterAsync(years, branchIds, areas, riskRatings, officerIds, statuses, lapsesType, focusType, focusId, focusValue));
}
