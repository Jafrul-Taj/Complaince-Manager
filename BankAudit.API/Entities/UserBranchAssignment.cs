namespace BankAudit.API.Entities;

public class UserBranchAssignment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int BranchId { get; set; }
    public int Year { get; set; }

    public User User { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
}
