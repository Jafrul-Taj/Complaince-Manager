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
    public async Task<IActionResult> GetKpis([FromQuery] int year) =>
        Ok(await _service.GetKpisAsync(year));

    [HttpGet("risk-distribution")]
    public async Task<IActionResult> GetRiskDistribution([FromQuery] int year) =>
        Ok(await _service.GetRiskDistributionAsync(year));

    [HttpGet("status-breakdown")]
    public async Task<IActionResult> GetStatusBreakdown([FromQuery] int year) =>
        Ok(await _service.GetStatusBreakdownAsync(year));

    [HttpGet("branch-summary")]
    public async Task<IActionResult> GetBranchSummary([FromQuery] int year) =>
        Ok(await _service.GetBranchSummaryAsync(year));

    [HttpGet("trend")]
    public async Task<IActionResult> GetMonthlyTrend([FromQuery] int year) =>
        Ok(await _service.GetMonthlyTrendAsync(year));

    [HttpGet("export")]
    public async Task<IActionResult> GetExportData([FromQuery] int year, [FromQuery] int? branchId) =>
        Ok(await _service.GetExportDataAsync(year, branchId));
}
