using BankAudit.API.Data;
using BankAudit.API.DTOs.ICCDEmployees;
using BankAudit.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Controllers;

[ApiController]
[Route("api/iccdemployee")]
[Authorize]
public class ICCDEmployeeController : ControllerBase
{
    private readonly AppDbContext _db;

    public ICCDEmployeeController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? wing,
        [FromQuery] string? designation,
        [FromQuery] string? unit)
    {
        var query = _db.ICCDEmployees.AsQueryable();

        if (!string.IsNullOrWhiteSpace(wing))
            query = query.Where(e => e.Wing == wing);

        if (!string.IsNullOrWhiteSpace(designation))
            query = query.Where(e => e.Designation == designation);

        if (!string.IsNullOrWhiteSpace(unit))
            query = query.Where(e => e.Unit == unit);

        var result = await query
            .OrderBy(e => e.Wing)
            .ThenBy(e => e.Name)
            .Select(e => ToDto(e))
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var employee = await _db.ICCDEmployees.FindAsync(id);
        return employee is null ? NotFound() : Ok(ToDto(employee));
    }

    [HttpPost]
    [Authorize(Roles = "Operator")]
    public async Task<IActionResult> Create([FromBody] ICCDEmployeeCreateDto dto)
    {
        var employee = new ICCDEmployee
        {
            Id = Guid.NewGuid().ToString("N")[..8],
            Name = dto.Name.Trim(),
            Designation = dto.Designation.Trim(),
            Unit = dto.Unit.Trim(),
            Wing = dto.Wing.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.ICCDEmployees.Add(employee);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, ToDto(employee));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Operator")]
    public async Task<IActionResult> Update(string id, [FromBody] ICCDEmployeeUpdateDto dto)
    {
        var employee = await _db.ICCDEmployees.FindAsync(id);
        if (employee is null) return NotFound();

        if (dto.Name is not null) employee.Name = dto.Name.Trim();
        if (dto.Designation is not null) employee.Designation = dto.Designation.Trim();
        if (dto.Unit is not null) employee.Unit = dto.Unit.Trim();
        if (dto.Wing is not null) employee.Wing = dto.Wing.Trim();
        employee.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ToDto(employee));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Operator")]
    public async Task<IActionResult> Delete(string id)
    {
        var employee = await _db.ICCDEmployees.FindAsync(id);
        if (employee is null) return NotFound();

        _db.ICCDEmployees.Remove(employee);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ICCDEmployeeResponseDto ToDto(ICCDEmployee e) => new()
    {
        Id = e.Id,
        Name = e.Name,
        Designation = e.Designation,
        Unit = e.Unit,
        Wing = e.Wing
    };
}
