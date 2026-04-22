using BankAudit.API.DTOs.Branches;
using BankAudit.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BankAudit.API.Controllers;

[ApiController]
[Route("api/branches")]
[Authorize]
public class BranchesController : ControllerBase
{
    private readonly IBranchService _service;

    public BranchesController(IBranchService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var branch = await _service.GetByIdAsync(id);
        return branch is null ? NotFound() : Ok(branch);
    }

    [HttpPost]
    [Authorize(Roles = "Operator")]
    public async Task<IActionResult> Create([FromBody] CreateBranchRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Operator")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBranchRequest request)
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
