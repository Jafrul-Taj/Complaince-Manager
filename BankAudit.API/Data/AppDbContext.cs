using BankAudit.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace BankAudit.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<UserBranchAssignment> UserBranchAssignments => Set<UserBranchAssignment>();
    public DbSet<AuditFinding> AuditFindings => Set<AuditFinding>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Username).IsUnique();
            e.Property(u => u.Role).HasConversion<string>();
        });

        modelBuilder.Entity<Branch>(e =>
        {
            e.HasIndex(b => b.BranchCode).IsUnique();
        });

        modelBuilder.Entity<UserBranchAssignment>(e =>
        {
            e.HasIndex(a => new { a.UserId, a.BranchId, a.Year }).IsUnique();
            e.HasOne(a => a.User)
             .WithMany(u => u.Assignments)
             .HasForeignKey(a => a.UserId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.Branch)
             .WithMany(b => b.Assignments)
             .HasForeignKey(a => a.BranchId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AuditFinding>(e =>
        {
            e.Property(f => f.RiskRating).HasConversion<string>();
            e.Property(f => f.RectificationStatus).HasConversion<string>();
            e.HasOne(f => f.Branch)
             .WithMany(b => b.Findings)
             .HasForeignKey(f => f.BranchId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(f => f.AssignedOfficer)
             .WithMany(u => u.Findings)
             .HasForeignKey(f => f.AssignedOfficerId)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
