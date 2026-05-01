using System.Security.Claims;
using BankAudit.API.DTOs.Findings;
using BankAudit.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BankAudit.API.Controllers;

[ApiController]
[Route("api/findings")]
[Authorize]
public class FindingsController : ControllerBase
{
    private readonly IFindingService _service;

    public FindingsController(IFindingService service) => _service = service;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [Authorize(Roles = "ComplianceOfficer,ComplianceHead,Operator")]
    public async Task<IActionResult> GetAll([FromQuery] int? year, [FromQuery] int? branchId, [FromQuery] int? reportId)
    {
        var isOfficer = User.IsInRole("ComplianceOfficer");
        return Ok(await _service.GetAllAsync(CurrentUserId, isOfficer, year, branchId, reportId));
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "ComplianceOfficer,ComplianceHead,Operator")]
    public async Task<IActionResult> GetById(int id)
    {
        var finding = await _service.GetByIdAsync(id);
        return finding is null ? NotFound() : Ok(finding);
    }

    [HttpPost]
    [Authorize(Roles = "ComplianceOfficer")]
    public async Task<IActionResult> Create([FromBody] CreateFindingRequest request)
    {
        var result = await _service.CreateAsync(request, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ComplianceOfficer")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateFindingRequest request)
    {
        var result = await _service.UpdateAsync(id, request, CurrentUserId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPatch("{id}/rectify")]
    [Authorize(Roles = "ComplianceOfficer")]
    public async Task<IActionResult> Rectify(int id, [FromBody] RectifyFindingRequest request)
    {
        var result = await _service.RectifyAsync(id, request, CurrentUserId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ComplianceOfficer,Operator")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }
}
