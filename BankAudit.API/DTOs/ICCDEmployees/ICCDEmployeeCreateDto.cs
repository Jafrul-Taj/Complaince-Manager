using System.ComponentModel.DataAnnotations;

namespace BankAudit.API.DTOs.ICCDEmployees;

public class ICCDEmployeeCreateDto
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Designation { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Unit { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Wing { get; set; } = string.Empty;
}
