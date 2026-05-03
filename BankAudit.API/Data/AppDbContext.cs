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
    public DbSet<ICCDEmployee> ICCDEmployees => Set<ICCDEmployee>();
    public DbSet<ComplianceAuditReport> ComplianceAuditReports => Set<ComplianceAuditReport>();

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
            e.HasIndex(a => new { a.UserId, a.BranchId }).IsUnique();
            e.HasOne(a => a.User)
             .WithMany(u => u.Assignments)
             .HasForeignKey(a => a.UserId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.Branch)
             .WithMany(b => b.Assignments)
             .HasForeignKey(a => a.BranchId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ComplianceAuditReport>(e =>
        {
            e.HasIndex(r => new { r.BranchId, r.Year }).IsUnique();
            e.HasOne(r => r.User)
             .WithMany(u => u.ComplianceAuditReports)
             .HasForeignKey(r => r.UserId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Branch)
             .WithMany(b => b.ComplianceAuditReports)
             .HasForeignKey(r => r.BranchId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.AuditTeamLead)
             .WithMany()
             .HasForeignKey(r => r.AuditTeamLeadId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AuditFinding>(e =>
        {
            e.Property(f => f.RiskRating).HasConversion<string>();
            e.HasOne(f => f.ComplianceAuditReport)
             .WithMany(r => r.Findings)
             .HasForeignKey(f => f.ComplianceAuditReportId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(f => f.Branch)
             .WithMany(b => b.Findings)
             .HasForeignKey(f => f.BranchId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(f => f.AssignedOfficer)
             .WithMany(u => u.Findings)
             .HasForeignKey(f => f.AssignedOfficerId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ICCDEmployee>(e =>
        {
            e.HasIndex(x => x.EmployeeId).IsUnique();
        });
    }
}
