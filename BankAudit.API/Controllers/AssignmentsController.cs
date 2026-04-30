using System.Security.Claims;
using BankAudit.API.DTOs.Assignments;
using BankAudit.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BankAudit.API.Controllers;

[ApiController]
[Route("api/assignments")]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _service;

    public AssignmentsController(IAssignmentService service) => _service = service;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [Authorize(Roles = "Operator")]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("user/{userId}")]
    [Authorize(Roles = "Operator")]
    public async Task<IActionResult> GetByUser(int userId) =>
        Ok(await _service.GetByUserAsync(userId));

    [HttpGet("my-summary")]
    [Authorize(Roles = "ComplianceOfficer")]
    public async Task<IActionResult> GetMySummary() =>
        Ok(await _service.GetMyAssignmentSummaryAsync(CurrentUserId));

    [HttpPost]
    [Authorize(Roles = "Operator")]
    public async Task<IActionResult> Create([FromBody] AssignBranchRequest request)
    {
        var result = await _service.CreateAsync(request);
        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Operator")]
    public async Task<IActionResult> Update(int id, [FromBody] AssignBranchRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Operator")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }
}
