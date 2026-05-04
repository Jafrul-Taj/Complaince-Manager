using System.Security.Claims;
using BankAudit.API.Data;
using BankAudit.API.Entities;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BankAudit.API.Controllers;

[ApiController]
[Route("api/excel-upload")]
[Authorize(Roles = "Operator")]
public class ExcelUploadController : ControllerBase
{
    private readonly AppDbContext _db;

    public ExcelUploadController(AppDbContext db) => _db = db;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    [RequestSizeLimit(20 * 1024 * 1024)] // 20 MB
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".xlsx" && ext != ".xls")
            return BadRequest(new { message = "Only .xlsx / .xls files are accepted." });

        var records = new List<ExcelFileData>();
        var uploadedAt = DateTime.UtcNow;
        var uploadedById = CurrentUserId;
        var originalFileName = file.FileName;

        using var stream = file.OpenReadStream();
        using var workbook = new XLWorkbook(stream);

        var sheet = workbook.Worksheets.First();
        var lastRow = sheet.LastRowUsed()?.RowNumber() ?? 1;

        for (int r = 2; r <= lastRow; r++)
        {
            var row = sheet.Row(r);

            var col1 = row.Cell(1).GetString().Trim();
            if (string.IsNullOrWhiteSpace(col1)) continue;

            records.Add(new ExcelFileData
            {
                ComplianceOfficerName  = col1,
                BranchName             = row.Cell(2).GetString().Trim(),
                BranchCode             = row.Cell(3).GetString().Trim(),
                AuditTeamLeader        = row.Cell(4).GetString().Trim(),
                SlNo                   = row.Cell(5).GetString().Trim(),
                NameOfCustomer         = row.Cell(6).GetString().Trim(),
                DetailsOfIrregularities = row.Cell(7).GetString().Trim(),
                AuditBaseDate          = row.Cell(8).GetString().Trim(),
                Year                   = row.Cell(9).GetString().Trim(),
                LapsesOriginated       = row.Cell(10).GetString().Trim(),
                Area                   = row.Cell(11).GetString().Trim(),
                Category               = row.Cell(12).GetString().Trim(),
                RiskRating             = row.Cell(13).GetString().Trim(),
                LapsesType             = row.Cell(14).GetString().Trim(),
                NoOfInstances          = row.Cell(15).GetString().Trim(),
                ComplianceStatus       = row.Cell(16).GetString().Trim(),
                OriginalFileName       = originalFileName,
                UploadedById           = uploadedById,
                UploadedAt             = uploadedAt
            });
        }

        if (records.Count == 0)
            return BadRequest(new { message = "No data rows found in the file." });

        await _db.ExcelFileData.AddRangeAsync(records);
        await _db.SaveChangesAsync();

        return Ok(new { imported = records.Count, fileName = originalFileName });
    }

    [HttpGet]
    public IActionResult GetSummary()
    {
        var summary = _db.ExcelFileData
            .GroupBy(x => new { x.OriginalFileName, x.UploadedAt })
            .Select(g => new
            {
                fileName    = g.Key.OriginalFileName,
                uploadedAt  = g.Key.UploadedAt,
                recordCount = g.Count()
            })
            .OrderByDescending(x => x.uploadedAt)
            .ToList();

        return Ok(summary);
    }
}
