using BankAudit.API.DTOs.ComplianceAuditReports;

namespace BankAudit.API.Services.Interfaces;

public interface IComplianceAuditReportService
{
    Task<List<ComplianceAuditReportDto>> GetAllAsync();
    Task<List<ComplianceAuditReportDto>> GetMyReportsAsync(int officerId);
    Task<List<ComplianceAuditReportDto>> GetByBranchAsync(int branchId);
    Task<ComplianceAuditReportDto?> GetByIdAsync(int id);
    Task<ComplianceAuditReportDto> CreateAsync(CreateComplianceAuditReportRequest request, int officerId);
    Task<bool> DeleteAsync(int id);
}
