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
using System.Text.RegularExpressions;

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
    [RequestSizeLimit(20 * 1024 * 1024)]
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
                ComplianceOfficerName    = col1,
                BranchName               = row.Cell(2).GetString().Trim(),
                BranchCode               = row.Cell(3).GetString().Trim(),
                AuditTeamLeader          = row.Cell(4).GetString().Trim(),
                SlNo                     = row.Cell(5).GetString().Trim(),
                NameOfCustomer           = row.Cell(6).GetString().Trim(),
                DetailsOfIrregularities  = row.Cell(7).GetString().Trim(),
                AuditBaseDate            = row.Cell(8).GetString().Trim(),
                Year                     = row.Cell(9).GetString().Trim(),
                LapsesOriginated         = row.Cell(10).GetString().Trim(),
                Area                     = row.Cell(11).GetString().Trim(),
                Category                 = row.Cell(12).GetString().Trim(),
                RiskRating               = row.Cell(13).GetString().Trim(),
                LapsesType               = row.Cell(14).GetString().Trim(),
                NoOfInstances            = row.Cell(15).GetString().Trim(),
                ComplianceStatus         = row.Cell(16).GetString().Trim(),
                OriginalFileName         = originalFileName,
                UploadedById             = uploadedById,
                UploadedAt               = uploadedAt
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
                fileName       = g.Key.OriginalFileName,
                uploadedAt     = g.Key.UploadedAt,
                recordCount    = g.Count(),
                reconciledCount = g.Count(r => r.IsReconciled)
            })
            .OrderByDescending(x => x.uploadedAt)
            .ToList();

        return Ok(summary);
    }

    [HttpPost("reconcile")]
    public async Task<IActionResult> Reconcile()
    {
        var result = new ReconcileResultDto();

        var rows = await _db.ExcelFileData
            .Where(x => !x.IsReconciled)
            .ToListAsync();
        var groupedByBranchCode = await _db.ExcelFileData
            .Where(x => !x.IsReconciled)
            .GroupBy(x => x.BranchCode)
            .Select(g => new {
                BranchCode = g.Key,
                BranchName = g.First().BranchName,
                ComplianceOfficerName = g.First().ComplianceOfficerName
            })
            .ToListAsync();

        if (rows.Count == 0)
            return Ok(new { message = "No unreconciled rows found.", result });

        var users    = await _db.Users.ToListAsync();
        var branches = await _db.Branches.ToListAsync();
        var employees = await _db.ICCDEmployees.ToListAsync();



        var existingAssignments = await _db.UserBranchAssignments.ToListAsync();
        var existingReports     = await _db.ComplianceAuditReports.ToListAsync();

        //var userBranchAssignments = groupedByBranchCode.Select(branch => new UserBranchAssignment
        //{
        //    // You need to get UserId from ComplianceOfficerName or another source
        //    UserId = GetUserIdFromOfficerName(users, branch.ComplianceOfficerName), // Implement this
        //    BranchId = int.Parse(branch.BranchCode), // Implement this
        //}).ToList();

        foreach (var row in rows)
        {
            try
            {
                // --- resolve officer ---
                var officerName = ExtractNameBeforeComma(row.ComplianceOfficerName);
                var officer = FindUser(users, officerName);
                if (officer is null)
                {
                    result.Errors.Add($"Row {row.Id}: officer '{officerName}' not found in Users.");
                    continue;
                }

                // --- resolve branch ---
                var branch = branches.FirstOrDefault(b =>
                {
                    // Try to parse both as integers for numeric comparison
                    if (int.TryParse(b.BranchCode, out int branchCodeNum) &&
                        int.TryParse(row.BranchCode, out int rowBranchCodeNum))
                    {
                        return branchCodeNum == rowBranchCodeNum;
                    }
                    // Fallback to string comparison
                    return b.BranchCode.Equals(row.BranchCode, StringComparison.OrdinalIgnoreCase);
                });

                if (branch is null)
                {
                    result.Errors.Add($"Row {row.Id}: branch code '{row.BranchCode}' not found.");
                    continue;
                }

                // --- resolve team lead ---
                var leadName = ExtractNameBeforeComma(row.AuditTeamLeader);
                var lead = FindEmployee(employees, leadName);
                if (lead is null)
                {
                    result.Errors.Add($"Row {row.Id}: team lead '{leadName}' not found in ICCDEmployees.");
                    continue;
                }

                // --- parse year ---
                if (!int.TryParse(row.Year, out var year))
                {
                    result.Errors.Add($"Row {row.Id}: cannot parse year '{row.Year}'.");
                    continue;
                }

                // --- UserBranchAssignment ---
                var hasAssignment = existingAssignments.Any(a =>
                    a.UserId == officer.Id && a.BranchId == branch.Id);
                if (!hasAssignment)
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

                // --- ComplianceAuditReport ---
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
                    await _db.SaveChangesAsync(); // flush to get the Id
                    existingReports.Add(report);
                    result.ReportsCreated++;
                }

                // --- parse fields ---
                DateTime? auditBaseDate = null;
                if (!string.IsNullOrWhiteSpace(row.AuditBaseDate))
                {
                    var datePart = row.AuditBaseDate.Split(' ')[0]; // Gets "31/08/2024"

                    if (DateTime.TryParseExact(datePart, "dd/MM/yyyy",
                        CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDate))
                    {
                        auditBaseDate = parsedDate; // Already only date
                    }
                }

                if (!Enum.TryParse<RiskRating>(row.RiskRating, ignoreCase: true, out var riskRating))
                    riskRating = RiskRating.Low;

                // --- AuditFinding ---
                var finding = new AuditFinding
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
                    RiskRating              = riskRating,
                    ComplianceStatus        = row.ComplianceStatus,
                    LapsesType              = row.LapsesType,
                    NoOfInstances           = row.NoOfInstances,
                    AuditBaseDate           = auditBaseDate,
                    Year                    = year,
                    CreatedAt               = DateTime.UtcNow,
                    UpdatedAt               = DateTime.UtcNow
                };
                _db.AuditFindings.Add(finding);
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

    // Extract the name portion before the first comma, trimmed.
    private static string ExtractNameBeforeComma(string raw)
    {
        var idx = raw.IndexOf(',');
        return (idx > 0 ? raw[..idx] : raw).Trim();
    }

    // Case-insensitive exact match on FullName.
    private static User? FindUser(List<User> users, string name) =>
        users.FirstOrDefault(u =>
            u.FullName.Equals(name, StringComparison.OrdinalIgnoreCase));

    // Strip common honorific prefixes before comparing ICCDEmployee.Name.
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

        // exact match after stripping prefix
        return employees.FirstOrDefault(e =>
            Strip(e.Name).Equals(normalized, StringComparison.OrdinalIgnoreCase))
            // fallback: contains
            ?? employees.FirstOrDefault(e =>
                Strip(e.Name).Contains(normalized, StringComparison.OrdinalIgnoreCase)
                || normalized.Contains(Strip(e.Name), StringComparison.OrdinalIgnoreCase));
    }

    
}
