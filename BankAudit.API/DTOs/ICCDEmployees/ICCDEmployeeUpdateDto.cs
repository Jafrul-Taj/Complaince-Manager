using System.ComponentModel.DataAnnotations;

namespace BankAudit.API.DTOs.ICCDEmployees;

public class ICCDEmployeeUpdateDto
{
    [MaxLength(200)]
    public string? Name { get; set; }

    [MaxLength(20)]
    public string? Designation { get; set; }

    [MaxLength(50)]
    public string? Unit { get; set; }

    [MaxLength(50)]
    public string? Wing { get; set; }
}
