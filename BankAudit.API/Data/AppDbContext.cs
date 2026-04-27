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

        var seedDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<ICCDEmployee>().HasData(
            // RBIA – Audit
            new ICCDEmployee { Id = "5486",  Name = "Mr. Rashedur Rahman",              Designation = "FVP",  Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "4555",  Name = "Mr. Md. Kalim Uddin Mozumder",     Designation = "FVP",  Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "4566",  Name = "Mr. Md. Anwar Hossain",            Designation = "FVP",  Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "3277",  Name = "Mr. Md. Ashraf Uddin Bhuiyan",     Designation = "FVP",  Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "3773",  Name = "Mr. Md. Shahidul Islam Mollah",    Designation = "FVP",  Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "3385",  Name = "Mr. Md. Faruk Hossain",            Designation = "FVP",  Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "3681",  Name = "Mr. Md. Abdur Rob Howlader",       Designation = "VP",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "2932",  Name = "Mr. Kazi Zahirul Islam",           Designation = "VP",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "4606",  Name = "Mr. Chapal Barua",                 Designation = "VP",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "2458",  Name = "Mr. Ziaul Hasan Iftiar Mahbub",    Designation = "VP",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "5447",  Name = "Mr. Kazi Rakib Hossan",            Designation = "VP",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "3611",  Name = "Mr. Md. Kamal Hossain",            Designation = "VP",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "6875",  Name = "Mr. Mohammed Mohiuddin Biswas",    Designation = "VP",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "3535",  Name = "Mr. Abdul Ahad",                   Designation = "VP",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "4199",  Name = "Mr. Mahmudul Hasan",               Designation = "VP",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "2600",  Name = "Ms. Fatema-Tuj-Johura",            Designation = "VP",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "741",   Name = "Mr. Md. Saiful Kabir",             Designation = "FAVP", Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "7385",  Name = "Mr. Mohammad Anamul Haque",        Designation = "FAVP", Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "3609",  Name = "Mr. Md. Kamal Sarder",             Designation = "FAVP", Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "4200",  Name = "Mr. Rafiul Bari Khan",             Designation = "FAVP", Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "5873",  Name = "Mr. Sunnyeat Ismat Omith",         Designation = "FAVP", Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "4102",  Name = "Mr. Fahad Ahmed Bhuiyan",          Designation = "FAVP", Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "8072",  Name = "Mr. Mohammad Omar Faruque",        Designation = "FAVP", Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "3811",  Name = "Mr. Muhammad Mahbubur Rahman",     Designation = "FAVP", Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "4190",  Name = "Mr. S.M. Oly Ahad",               Designation = "FAVP", Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "8747",  Name = "Mr. Akram Uddin Majumder",         Designation = "AVP",  Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "5334",  Name = "Mr. Khandaker Abdul Muntashir",    Designation = "AVP",  Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "6048",  Name = "Mr. Md. Mehrab Khan",              Designation = "AVP",  Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "8731",  Name = "Mr. Ahmad Sayeed Russel",          Designation = "SEO",  Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "8739",  Name = "Mr. Md. Omar Faruk",               Designation = "SEO",  Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "8071",  Name = "Mr. Imtiaz Hossain",               Designation = "SEO",  Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "8678",  Name = "Mr. Feroz Hossain",                Designation = "SEO",  Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "10302", Name = "Mr. Ishtiaq Mahmud Emon",          Designation = "SEO",  Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "8750",  Name = "Mr. Kawsar Mohammad Farhad",       Designation = "EO",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "8741",  Name = "Mr. Kazi Shahriar Sonnet",         Designation = "EO",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "4052",  Name = "Mr. Aminul Islam",                 Designation = "EO",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "6323",  Name = "Mr. Raihan Kabir",                 Designation = "EO",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "6317",  Name = "Mr. Razib Khan",                   Designation = "EO",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "8751",  Name = "Mr. Md. Riaz Uddin",               Designation = "SO",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "8913",  Name = "Mr. Md. Mainuddin",                Designation = "SO",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "10274", Name = "Mr. Monir Ahammad Bhuiyan",        Designation = "SO",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "10301", Name = "Mr. Ashadus Jaman",                Designation = "SO",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            new ICCDEmployee { Id = "8048",  Name = "Mr. Mahede Hasan Shaoun",          Designation = "JO",   Unit = "Audit",      Wing = "RBIA",                 CreatedAt = seedDate },
            // FxAudit – Audit
            new ICCDEmployee { Id = "5438",  Name = "Mr. Md. Amirul Islam",             Designation = "VP",   Unit = "Audit",      Wing = "FxAudit",              CreatedAt = seedDate },
            new ICCDEmployee { Id = "8745",  Name = "Ms. Lubana Rahman",                Designation = "SEO",  Unit = "Audit",      Wing = "FxAudit",              CreatedAt = seedDate },
            // Special Investigation – Audit
            new ICCDEmployee { Id = "3479",  Name = "Mr. Muhammad Abdul Awal",          Designation = "EO",   Unit = "Audit",      Wing = "Special Investigation", CreatedAt = seedDate },
            new ICCDEmployee { Id = "3270",  Name = "Mr. Wayes Ahmed",                  Designation = "EO",   Unit = "Audit",      Wing = "Special Investigation", CreatedAt = seedDate },
            new ICCDEmployee { Id = "5702",  Name = "Mr. Mezbaul Haider",               Designation = "SO",   Unit = "Audit",      Wing = "Special Investigation", CreatedAt = seedDate },
            new ICCDEmployee { Id = "5286",  Name = "Mr. S.Md. Badiul Akbar",           Designation = "SO",   Unit = "Audit",      Wing = "Special Investigation", CreatedAt = seedDate },
            new ICCDEmployee { Id = "8079",  Name = "Mr. Jakir Hossain",                Designation = "SO",   Unit = "Audit",      Wing = "Special Investigation", CreatedAt = seedDate },
            new ICCDEmployee { Id = "6402",  Name = "Mr. Md. Rafiqur Rahman",           Designation = "SO",   Unit = "Audit",      Wing = "Special Investigation", CreatedAt = seedDate },
            new ICCDEmployee { Id = "8027",  Name = "Mr. Wahidul Islam",                Designation = "JO",   Unit = "Audit",      Wing = "Special Investigation", CreatedAt = seedDate },
            // Compliance – Compliance
            new ICCDEmployee { Id = "2959",  Name = "Mr. Md. Wasim Uddin Qureshi",      Designation = "FAVP", Unit = "Compliance", Wing = "Compliance",           CreatedAt = seedDate },
            new ICCDEmployee { Id = "6316",  Name = "Mr. Muhammad Sadequr Rahman",      Designation = "SEO",  Unit = "Compliance", Wing = "Compliance",           CreatedAt = seedDate },
            new ICCDEmployee { Id = "6324",  Name = "Mr. Mohammad Masuf Bin Nuruddin",  Designation = "SEO",  Unit = "Compliance", Wing = "Compliance",           CreatedAt = seedDate },
            new ICCDEmployee { Id = "9317",  Name = "Mr. Rathindra Nath Mondal",        Designation = "EO",   Unit = "Compliance", Wing = "Compliance",           CreatedAt = seedDate },
            new ICCDEmployee { Id = "9660",  Name = "Mr. Ujjwal Kanthi Dhar",           Designation = "EO",   Unit = "Compliance", Wing = "Compliance",           CreatedAt = seedDate },
            new ICCDEmployee { Id = "9661",  Name = "Ms. Rownak Tabassum Prima",        Designation = "EO",   Unit = "Compliance", Wing = "Compliance",           CreatedAt = seedDate },
            new ICCDEmployee { Id = "8200",  Name = "Mr. Sakif Samih-Ul-Haq",           Designation = "SO",   Unit = "Compliance", Wing = "Compliance",           CreatedAt = seedDate },
            new ICCDEmployee { Id = "9352",  Name = "Mr. S.M. Jafrul Hasan",            Designation = "OFF",  Unit = "Compliance", Wing = "Compliance",           CreatedAt = seedDate },
            new ICCDEmployee { Id = "7957",  Name = "Mr. Md. Salman Al-Mamun",          Designation = "OFF",  Unit = "Compliance", Wing = "Compliance",           CreatedAt = seedDate },
            new ICCDEmployee { Id = "10228", Name = "Mr. Samzid Khan",                  Designation = "JO",   Unit = "Compliance", Wing = "Compliance",           CreatedAt = seedDate }
        );
    }
}
