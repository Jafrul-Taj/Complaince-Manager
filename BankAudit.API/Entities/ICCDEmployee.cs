using System.ComponentModel.DataAnnotations;

namespace BankAudit.API.Entities;

public class ICCDEmployee
{
    [Key]
    [MaxLength(10)]
    public string Id { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Designation { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Unit { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Wing { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
