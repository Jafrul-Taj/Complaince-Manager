using BankAudit.API.Data;
using BankAudit.API.DTOs.ExcelUpload;
using BankAudit.API.Entities;
using BankAudit.API.Enums;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;

namespace BankAudit.API.Controllers;

[ApiController]
[Route("api/excel-upload")]
[Authorize(Roles = "Operator")]
public class ExcelUploadController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<ExcelUploadController> _logger;

    public ExcelUploadController(AppDbContext db, ILogger<ExcelUploadController> logger)
    {
        _db    = db;
        _logger = logger;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ──────────────────────────────────────────────────────────────
    // POST /api/excel-upload  — Import rows from all sheets
    // ──────────────────────────────────────────────────────────────
    [HttpPost]
    [RequestSizeLimit(100 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 100 * 1024 * 1024)]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".xlsx" && ext != ".xls")
            return BadRequest(new { message = "Only .xlsx / .xls files are accepted." });

        _logger.LogInformation("Excel import started: {File} ({Bytes:N0} bytes)",
            file.FileName, file.Length);

        var records    = new List<ExcelFileData>();
        var allErrors  = new List<string>();
        var sheetStats = new List<object>();
        var uploadedAt = DateTime.UtcNow;
        var uploadedBy = CurrentUserId;
        var fileName   = file.FileName;

        try
        {
            using var stream   = file.OpenReadStream();
            using var workbook = new XLWorkbook(stream);

            var visibleSheets = workbook.Worksheets
                .Where(ws => ws.Visibility == XLWorksheetVisibility.Visible)
                .ToList();

            _logger.LogInformation("{Count} visible sheet(s): {Names}",
                visibleSheets.Count,
                string.Join(", ", visibleSheets.Select(s => s.Name)));

            foreach (var sheet in visibleSheets)
            {
                // RowsUsed() is reliable — unlike LastRowUsed() it doesn't
                // undercount on certain file formats.
                var allRows  = sheet.RowsUsed().ToList();
                var dataRows = allRows.Skip(1).ToList(); // row 0 = header

                _logger.LogInformation("  Sheet '{Sheet}': {Header} header + {Data} data rows",
                    sheet.Name, 1, dataRows.Count);

                if (dataRows.Count == 0)
                {
                    _logger.LogInformation("  Sheet '{Sheet}' skipped — no data rows.", sheet.Name);
                    continue;
                }

                int imported = 0, skipped = 0;
                var sheetErrors = new List<string>();

                foreach (var row in dataRows)
                {
                    int rowNum = row.RowNumber();
                    try
                    {
                        var c1  = SafeString(row.Cell(1));  // ComplianceOfficerName
                        var c2  = SafeString(row.Cell(2));  // BranchName
                        var c3  = SafeString(row.Cell(3));  // BranchCode
                        var c5  = SafeString(row.Cell(5));  // SlNo

                        // Skip only when ALL anchor columns are blank
                        if (string.IsNullOrWhiteSpace(c1) &&
                            string.IsNullOrWhiteSpace(c2) &&
                            string.IsNullOrWhiteSpace(c3) &&
                            string.IsNullOrWhiteSpace(c5))
                        {
                            skipped++;
                            continue;
                        }

                        records.Add(new ExcelFileData
                        {
                            ComplianceOfficerName   = c1,
                            BranchName              = c2,
                            BranchCode              = c3,
                            AuditTeamLeader         = SafeString(row.Cell(4)),
                            SlNo                    = c5,
                            NameOfCustomer          = SafeString(row.Cell(6)),
                            DetailsOfIrregularities = SafeString(row.Cell(7)),
                            AuditBaseDate           = SafeString(row.Cell(8)),
                            Year                    = SafeString(row.Cell(9)),
                            LapsesOriginated        = SafeString(row.Cell(10)),
                            Area                    = SafeString(row.Cell(11)),
                            Category                = SafeString(row.Cell(12)),
                            RiskRating              = SafeString(row.Cell(13)),
                            LapsesType              = SafeString(row.Cell(14)),
                            NoOfInstances           = SafeString(row.Cell(15)),
                            ComplianceStatus        = SafeString(row.Cell(16)),
                            OriginalFileName        = fileName,
                            UploadedById            = uploadedBy,
                            UploadedAt              = uploadedAt
                        });
                        imported++;
                    }
                    catch (Exception ex)
                    {
                        var msg = $"[{sheet.Name}] Row {rowNum}: {ex.Message}";
                        sheetErrors.Add(msg);
                        _logger.LogWarning("[{Sheet}] Row {RowNum}: {Error}",
                            sheet.Name, rowNum, ex.Message);
                        skipped++;
                    }
                }

                _logger.LogInformation(
                    "  Sheet '{Sheet}' done — imported={Imp}, skipped={Skp}, errors={Err}",
                    sheet.Name, imported, skipped, sheetErrors.Count);

                sheetStats.Add(new
                {
                    sheetName    = sheet.Name,
                    totalRows    = dataRows.Count,
                    imported,
                    skipped,
                    errors       = sheetErrors.Count
                });

                // Keep at most 20 per-sheet errors in the response
                allErrors.AddRange(sheetErrors.Take(20));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse file '{File}'", fileName);
            return BadRequest(new { message = $"Cannot read Excel file: {ex.Message}" });
        }

        _logger.LogInformation("Grand total: {Total} records ready for insert, {Err} row errors",
            records.Count, allErrors.Count);

        if (records.Count == 0)
            return BadRequest(new
            {
                message = "No valid data rows found in the file.",
                sheetStats,
                rowErrors = allErrors.Take(50)
            });

        // Batch insert — 1 000 rows per SaveChanges to balance memory + speed
        const int batch = 1_000;
        for (int i = 0; i < records.Count; i += batch)
        {
            var slice = records.GetRange(i, Math.Min(batch, records.Count - i));
            await _db.ExcelFileData.AddRangeAsync(slice);
            await _db.SaveChangesAsync();
            _logger.LogInformation("DB insert batch {B}/{Total}", i / batch + 1,
                (int)Math.Ceiling((double)records.Count / batch));
        }

        return Ok(new
        {
            imported        = records.Count,
            fileName,
            sheetsProcessed = sheetStats.Count,
            skippedRows     = allErrors.Count,
            sheetStats,
            rowErrors       = allErrors.Take(50).ToList()
        });
    }

    // ──────────────────────────────────────────────────────────────
    // GET /api/excel-upload
    // ──────────────────────────────────────────────────────────────
    [HttpGet]
    public IActionResult GetSummary()
    {
        var summary = _db.ExcelFileData
            .GroupBy(x => new { x.OriginalFileName, x.UploadedAt })
            .Select(g => new
            {
                fileName       = g.Key.OriginalFileName,
                uploadedAt     = g.Key.UploadedAt,
                recordCount    = g.Count(),
                reconciledCount = g.Count(r => r.IsReconciled)
            })
            .OrderByDescending(x => x.uploadedAt)
            .ToList();

        return Ok(summary);
    }

    // ──────────────────────────────────────────────────────────────
    // POST /api/excel-upload/reconcile
    // ──────────────────────────────────────────────────────────────
    [HttpPost("reconcile")]
    public async Task<IActionResult> Reconcile()
    {
        var result = new ReconcileResultDto();

        var rows = await _db.ExcelFileData
            .Where(x => !x.IsReconciled)
            .ToListAsync();

        if (rows.Count == 0)
            return Ok(new { message = "No unreconciled rows found.", result });

        var users     = await _db.Users.ToListAsync();
        var branches  = await _db.Branches.ToListAsync();
        var employees = await _db.ICCDEmployees.ToListAsync();

        var existingAssignments = await _db.UserBranchAssignments.ToListAsync();
        var existingReports     = await _db.ComplianceAuditReports.ToListAsync();

        foreach (var row in rows)
        {
            try
            {
                // resolve officer
                var officerName = ExtractNameBeforeComma(row.ComplianceOfficerName);
                var officer = FindUser(users, officerName);
                if (officer is null)
                {
                    result.Errors.Add($"Row {row.Id}: officer '{officerName}' not found.");
                    continue;
                }

                // resolve branch
                var branch = branches.FirstOrDefault(b =>
                {
                    if (int.TryParse(b.BranchCode, out int bNum) &&
                        int.TryParse(row.BranchCode, out int rNum))
                        return bNum == rNum;
                    return b.BranchCode.Equals(row.BranchCode, StringComparison.OrdinalIgnoreCase);
                });
                if (branch is null)
                {
                    result.Errors.Add($"Row {row.Id}: branch code '{row.BranchCode}' not found.");
                    continue;
                }

                // resolve team lead
                var leadName = ExtractNameBeforeComma(row.AuditTeamLeader);
                var lead = FindEmployee(employees, leadName);
                if (lead is null)
                {
                    result.Errors.Add($"Row {row.Id}: team lead '{leadName}' not found.");
                    continue;
                }

                // parse year
                if (!int.TryParse(row.Year, out var year))
                {
                    result.Errors.Add($"Row {row.Id}: cannot parse year '{row.Year}'.");
                    continue;
                }

                // UserBranchAssignment
                if (!existingAssignments.Any(a => a.UserId == officer.Id && a.BranchId == branch.Id))
                {
                    var assignment = new UserBranchAssignment
                    {
                        UserId   = officer.Id,
                        BranchId = branch.Id
                    };
                    _db.UserBranchAssignments.Add(assignment);
                    existingAssignments.Add(assignment);
                    result.AssignmentsCreated++;
                }

                // ComplianceAuditReport
                var report = existingReports.FirstOrDefault(r =>
                    r.BranchId == branch.Id && r.Year == year);
                if (report is null)
                {
                    report = new ComplianceAuditReport
                    {
                        UserId          = officer.Id,
                        BranchId        = branch.Id,
                        Year            = year,
                        AuditTeamLeadId = lead.Id,
                        CreatedAt       = DateTime.UtcNow
                    };
                    _db.ComplianceAuditReports.Add(report);
                    await _db.SaveChangesAsync();
                    existingReports.Add(report);
                    result.ReportsCreated++;
                }

                // AuditFinding
                DateTime? auditBaseDate = null;
                if (!string.IsNullOrWhiteSpace(row.AuditBaseDate))
                {
                    var datePart = row.AuditBaseDate.Split(' ')[0];
                    if (DateTime.TryParseExact(datePart, "dd/MM/yyyy",
                        CultureInfo.InvariantCulture, DateTimeStyles.None, out var d))
                        auditBaseDate = d;
                }

                if (!Enum.TryParse<RiskRating>(row.RiskRating, ignoreCase: true, out var risk))
                    risk = RiskRating.Low;

                _db.AuditFindings.Add(new AuditFinding
                {
                    ComplianceAuditReportId = report.Id,
                    BranchId                = branch.Id,
                    AssignedOfficerId       = officer.Id,
                    FindingArea             = row.Area,
                    SlNo                    = row.SlNo,
                    NameOfCustomers         = row.NameOfCustomer,
                    FindingDetails          = row.DetailsOfIrregularities,
                    LapsesOriginated        = row.LapsesOriginated,
                    Category                = row.Category,
                    RiskRating              = risk,
                    ComplianceStatus        = row.ComplianceStatus,
                    LapsesType              = row.LapsesType,
                    NoOfInstances           = row.NoOfInstances,
                    AuditBaseDate           = auditBaseDate,
                    Year                    = year,
                    CreatedAt               = DateTime.UtcNow,
                    UpdatedAt               = DateTime.UtcNow
                });
                result.FindingsCreated++;
                row.IsReconciled = true;
                result.RowsReconciled++;
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Row {row.Id}: unexpected error — {ex.Message}");
            }
        }

        await _db.SaveChangesAsync();
        return Ok(result);
    }

    // ──────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Reads a cell's string value robustly, handling merged cells and
    /// all cell types (text, numeric, date, boolean, formula).
    /// </summary>
    private static string SafeString(IXLCell cell)
    {
        try
        {
            // Merged cells: only the top-left cell holds the value
            if (cell.IsMerged())
            {
                var first = cell.MergedRange()?.FirstCell();
                if (first != null && first.Address.RowNumber != cell.Address.RowNumber
                                  || first?.Address.ColumnNumber != cell.Address.ColumnNumber)
                    return SafeString(first!);
            }

            return cell.GetString()?.Trim() ?? string.Empty;
        }
        catch
        {
            // Last-resort fallback for exotic cell types
            try { return cell.Value.ToString()?.Trim() ?? string.Empty; }
            catch { return string.Empty; }
        }
    }

    private static string ExtractNameBeforeComma(string raw)
    {
        var idx = raw.IndexOf(',');
        return (idx > 0 ? raw[..idx] : raw).Trim();
    }

    private static User? FindUser(List<User> users, string name) =>
        users.FirstOrDefault(u =>
            u.FullName.Equals(name, StringComparison.OrdinalIgnoreCase));

    private static ICCDEmployee? FindEmployee(List<ICCDEmployee> employees, string name)
    {
        static string Strip(string n)
        {
            foreach (var p in new[] { "Mr. ", "Ms. ", "Md. ", "Dr. " })
                if (n.StartsWith(p, StringComparison.OrdinalIgnoreCase))
                    return n[p.Length..].Trim();
            return n.Trim();
        }
        var normalized = Strip(name);
        return employees.FirstOrDefault(e =>
            Strip(e.Name).Equals(normalized, StringComparison.OrdinalIgnoreCase))
            ?? employees.FirstOrDefault(e =>
                Strip(e.Name).Contains(normalized, StringComparison.OrdinalIgnoreCase)
                || normalized.Contains(Strip(e.Name), StringComparison.OrdinalIgnoreCase));
    }
}
