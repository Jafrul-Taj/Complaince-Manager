using System.ComponentModel.DataAnnotations;

namespace BankAudit.API.DTOs.Assignments;

public class AssignBranchRequest
{
    [Required] public int UserId { get; set; }
    [Required] public int BranchId { get; set; }
    [Required, Range(2000, 2100)] public int Year { get; set; }
}
