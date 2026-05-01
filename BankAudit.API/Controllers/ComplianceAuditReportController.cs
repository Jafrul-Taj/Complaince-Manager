using System.Security.Claims;
using BankAudit.API.DTOs.ComplianceAuditReports;
using BankAudit.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BankAudit.API.Controllers;

[ApiController]
[Route("api/compliance-audit-reports")]
[Authorize]
public class ComplianceAuditReportController : ControllerBase
{
    private readonly IComplianceAuditReportService _service;

    public ComplianceAuditReportController(IComplianceAuditReportService service) => _service = service;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [Authorize(Roles = "ComplianceOfficer,ComplianceHead,Operator")]
    public async Task<IActionResult> GetAll() =>
        Ok(await _service.GetAllAsync());

    [HttpGet("my-reports")]
    [Authorize(Roles = "ComplianceOfficer")]
    public async Task<IActionResult> GetMyReports() =>
        Ok(await _service.GetMyReportsAsync(CurrentUserId));

    [HttpGet("branch/{branchId}")]
    [Authorize(Roles = "ComplianceOfficer,ComplianceHead,Operator")]
    public async Task<IActionResult> GetByBranch(int branchId) =>
        Ok(await _service.GetByBranchAsync(branchId));

    [HttpGet("{id}")]
    [Authorize(Roles = "ComplianceOfficer,ComplianceHead,Operator")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "ComplianceOfficer")]
    public async Task<IActionResult> Create([FromBody] CreateComplianceAuditReportRequest request)
    {
        var result = await _service.CreateAsync(request, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ComplianceOfficer,Operator")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }
}
