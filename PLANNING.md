# Bank Audit Findings Management System
## Complete Project Planning Document

---

## 1. Project Overview

A web-based compliance management application for banks to track, manage, and report on audit findings. The system supports three user roles with distinct responsibilities, a full findings lifecycle (create → rectify), and a reporting dashboard with Excel export.

---

## 2. Technology Stack

| Layer      | Technology                        | Version  |
|------------|-----------------------------------|----------|
| Backend    | ASP.NET Core Web API              | 8.0      |
| Database   | SQLite + Entity Framework Core    | 8.0      |
| Auth       | JWT Bearer + BCrypt               | —        |
| API Docs   | Swagger (Swashbuckle)             | 6.6.2    |
| Frontend   | Angular (Standalone Components)   | 17       |
| UI Library | Angular Material (Indigo/Pink)    | 17       |
| Charts     | ApexCharts (ng-apexcharts)        | 1.10.0   |
| Excel      | SheetJS (xlsx) + file-saver       | 0.18.5   |

---

## 3. User Roles

### 3.1 Operator
- Create, edit, activate/deactivate users (Compliance Officers, Compliance Heads)
- Create and manage branches (name + code)
- Assign branches and audit years to Compliance Officers
- View the dashboard

### 3.2 Compliance Officer
- View only their assigned branches and findings
- Create new audit findings
- Edit existing findings
- Mark findings as In Progress or Rectified (with remarks)
- Cannot see other officers' findings

### 3.3 Compliance Head
- View all findings across all branches
- Access the full reporting dashboard
- Filter findings by branch, year, risk rating, status
- Export filtered findings to Excel

---

## 4. Project Folder Structure

```
Complaince Manager/                    ← Git repository root
│
├── BankAudit.API/                     ← ASP.NET Core 8 Backend
│   ├── Controllers/
│   │   ├── AuthController.cs          POST /api/auth/login
│   │   ├── UsersController.cs         CRUD /api/users
│   │   ├── BranchesController.cs      CRUD /api/branches
│   │   ├── AssignmentsController.cs   /api/assignments
│   │   ├── FindingsController.cs      CRUD /api/findings
│   │   └── DashboardController.cs     /api/dashboard/*
│   │
│   ├── Data/
│   │   ├── AppDbContext.cs            EF Core DbContext
│   │   └── DataSeeder.cs             Seeds admin user on startup
│   │
│   ├── Entities/
│   │   ├── User.cs
│   │   ├── Branch.cs
│   │   ├── UserBranchAssignment.cs
│   │   └── AuditFinding.cs
│   │
│   ├── Enums/
│   │   ├── UserRole.cs               Operator, ComplianceOfficer, ComplianceHead
│   │   ├── RiskRating.cs             Low, Medium, High, Critical
│   │   └── RectificationStatus.cs    Pending, InProgress, Rectified
│   │
│   ├── DTOs/                         Request/Response data transfer objects
│   │   ├── Auth/
│   │   ├── Users/
│   │   ├── Branches/
│   │   ├── Assignments/
│   │   ├── Findings/
│   │   └── Dashboard/
│   │
│   ├── Services/                     Business logic layer
│   │   ├── Interfaces/
│   │   ├── AuthService.cs
│   │   ├── UserService.cs
│   │   ├── BranchService.cs
│   │   ├── AssignmentService.cs
│   │   ├── FindingService.cs
│   │   └── DashboardService.cs
│   │
│   ├── Middleware/
│   │   └── ExceptionMiddleware.cs    Global error handler
│   │
│   ├── Migrations/                   EF Core auto-generated
│   ├── Program.cs                    App startup, DI, JWT, CORS, Swagger
│   └── appsettings.json              Connection string + JWT config
│
└── bank-audit-ui/                     ← Angular 17 Frontend
    └── src/app/
        ├── app.config.ts              Providers: router, animations, http+jwt
        ├── app.routes.ts              All lazy-loaded routes with guards
        │
        ├── core/
        │   ├── models/               TypeScript interfaces
        │   ├── services/             HTTP service wrappers
        │   ├── interceptors/
        │   │   └── jwt.interceptor.ts  Auto-attach Bearer token
        │   └── guards/
        │       ├── auth.guard.ts       Redirect to login if not authenticated
        │       └── role.guard.ts       Redirect if wrong role
        │
        ├── layout/
        │   ├── main-layout/          mat-sidenav shell
        │   └── sidebar/              Role-based navigation menu
        │
        └── features/
            ├── auth/login/           Login page
            ├── users/                User list + form dialog (Operator)
            ├── branches/             Branch list + form dialog (Operator)
            ├── assignments/          Branch-year assignment manager (Operator)
            ├── findings/             Findings list + form + rectify modal (Officer)
            └── dashboard/            Charts + KPIs + Excel export (Head)
```

---

## 5. Database Schema

### Users
| Column       | Type     | Notes                              |
|--------------|----------|------------------------------------|
| Id           | INTEGER  | Primary key, auto-increment        |
| Username     | TEXT     | Unique                             |
| PasswordHash | TEXT     | BCrypt hashed                      |
| FullName     | TEXT     |                                    |
| Role         | TEXT     | Operator / ComplianceOfficer / ComplianceHead |
| Email        | TEXT     |                                    |
| IsActive     | INTEGER  | 1 = active, 0 = inactive           |
| CreatedAt    | TEXT     | UTC datetime                       |

### Branches
| Column     | Type    | Notes              |
|------------|---------|--------------------|
| Id         | INTEGER | Primary key        |
| BranchName | TEXT    |                    |
| BranchCode | TEXT    | Unique, uppercase  |
| IsActive   | INTEGER |                    |

### UserBranchAssignments
| Column   | Type    | Notes                                      |
|----------|---------|--------------------------------------------|
| Id       | INTEGER | Primary key                                |
| UserId   | INTEGER | FK → Users                                 |
| BranchId | INTEGER | FK → Branches                              |
| Year     | INTEGER | Audit year (e.g. 2024)                     |
|          |         | Unique constraint: (UserId, BranchId, Year) |

### AuditFindings
| Column                | Type    | Notes                              |
|-----------------------|---------|------------------------------------|
| Id                    | INTEGER | Primary key                        |
| BranchId              | INTEGER | FK → Branches                      |
| AssignedOfficerId     | INTEGER | FK → Users                         |
| FindingArea           | TEXT    | Category of finding                |
| SlNo                  | TEXT    | Serial number (e.g. "i.", "viii.") |
| FindingDetails        | TEXT    | Full description                   |
| RiskRating            | TEXT    | Low / Medium / High / Critical     |
| NoOfInstances         | TEXT    | Free text (e.g. "3", "NI ACT Case")|
| RectificationStatus   | TEXT    | Pending / InProgress / Rectified   |
| RectificationRemarks  | TEXT    | Nullable                           |
| RectifiedAt           | TEXT    | Nullable, set when Rectified       |
| Year                  | INTEGER | Audit year                         |
| CreatedAt             | TEXT    | UTC datetime                       |
| UpdatedAt             | TEXT    | UTC datetime                       |

---

## 6. API Endpoints

### Authentication
| Method | Endpoint           | Role      | Description        |
|--------|--------------------|-----------|--------------------|
| POST   | /api/auth/login    | Anonymous | Returns JWT token  |

### Users
| Method | Endpoint        | Role     | Description      |
|--------|-----------------|----------|------------------|
| GET    | /api/users      | Operator | Get all users    |
| GET    | /api/users/{id} | Operator | Get user by id   |
| POST   | /api/users      | Operator | Create user      |
| PUT    | /api/users/{id} | Operator | Update user      |
| DELETE | /api/users/{id} | Operator | Delete user      |

### Branches
| Method | Endpoint            | Role             | Description        |
|--------|---------------------|------------------|--------------------|
| GET    | /api/branches       | All logged in    | Get all branches   |
| POST   | /api/branches       | Operator         | Create branch      |
| PUT    | /api/branches/{id}  | Operator         | Update branch      |
| DELETE | /api/branches/{id}  | Operator         | Delete branch      |

### Assignments
| Method | Endpoint                       | Role     | Description              |
|--------|--------------------------------|----------|--------------------------|
| GET    | /api/assignments               | Operator | Get all assignments      |
| GET    | /api/assignments/user/{userId} | Operator | Get by officer           |
| POST   | /api/assignments               | Operator | Create assignment        |
| DELETE | /api/assignments/{id}          | Operator | Remove assignment        |

### Findings
| Method | Endpoint                      | Role            | Description                    |
|--------|-------------------------------|-----------------|--------------------------------|
| GET    | /api/findings?year=&branchId= | Officer/Head    | Officer sees own; Head sees all|
| GET    | /api/findings/{id}            | Officer/Head    | Get single finding             |
| POST   | /api/findings                 | Officer         | Create finding                 |
| PUT    | /api/findings/{id}            | Officer         | Update finding (own only)      |
| PATCH  | /api/findings/{id}/rectify    | Officer         | Update rectification status    |
| DELETE | /api/findings/{id}            | Officer/Operator| Delete finding                 |

### Dashboard
| Method | Endpoint                              | Role             | Description               |
|--------|---------------------------------------|------------------|---------------------------|
| GET    | /api/dashboard/kpis?year=             | Head / Operator  | KPI summary numbers       |
| GET    | /api/dashboard/risk-distribution?year=| Head / Operator  | Count by risk rating      |
| GET    | /api/dashboard/status-breakdown?year= | Head / Operator  | Count by status           |
| GET    | /api/dashboard/branch-summary?year=   | Head / Operator  | Summary per branch        |
| GET    | /api/dashboard/trend?year=            | Head / Operator  | Monthly finding count     |
| GET    | /api/dashboard/export?year=&branchId= | Head / Operator  | Full data for Excel export|

---

## 7. Frontend Pages & Features

### Login Page
- Username + password form
- Error message on failure
- Auto-redirects by role after login:
  - Operator → `/app/users`
  - Compliance Officer → `/app/findings`
  - Compliance Head → `/app/dashboard`

### Sidebar Navigation (Role-based)
| Menu Item   | Icon           | Route             | Visible To                  |
|-------------|----------------|-------------------|-----------------------------|
| Dashboard   | dashboard      | /app/dashboard    | Operator, Compliance Head   |
| Users       | people         | /app/users        | Operator                    |
| Branches    | business       | /app/branches     | Operator                    |
| Assignments | assignment_ind | /app/assignments  | Operator                    |
| My Findings | fact_check     | /app/findings     | Compliance Officer          |

### User Management (Operator only)
- Table with search filter
- Columns: Full Name, Username, Role (colored badge), Email, Status, Actions
- Add user dialog: username, password, full name, role, email
- Edit user dialog: full name, email, active toggle, optional new password
- Delete with confirmation

### Branch Management (Operator only)
- Table: Code, Branch Name, Status, Actions
- Add branch: code (auto-uppercase) + name
- Edit branch: name + active toggle
- Delete with confirmation

### Assignment Manager (Operator only)
- Left panel: form to select officer + branch + year → Assign button
- Right panel: live table of all current assignments with Remove button
- Prevents duplicate assignments (same officer + branch + year)

### Findings List (Compliance Officer only)
- Filters: Year, Branch (officer's assigned only), Risk Rating, Status
- Table: Sl.No, Branch, Finding Area, Details (truncated), Risk chip, Status chip, Year, Actions
- Actions: Edit, Rectify (if not Rectified), Delete
- Risk chip colors: Critical=red, High=orange, Medium=yellow, Low=green
- Status chip colors: Pending=grey, InProgress=blue, Rectified=green

### Finding Form Dialog
- Fields: Branch (dropdown, officer's assignments), Year, Sl.No, Finding Area, Finding Details (textarea), Risk Rating, No. of Instances

### Rectify Modal Dialog
- Shows finding summary (Sl.No, Area, Branch, Year)
- Status dropdown: InProgress or Rectified
- Remarks textarea (required, min 10 chars)

### Dashboard (Compliance Head / Operator)
- Year selector filter (top right)
- Branch filter for Excel export
- **6 KPI Cards**: Total Findings, Critical, High Risk, Rectified, Pending, Rectification Rate %
- **4 Charts**:
  - Donut — Risk Distribution (Low/Medium/High/Critical)
  - Bar — Rectification Status (Pending/InProgress/Rectified)
  - Horizontal Bar — Branch-wise Findings (top branches)
  - Smooth Line — Monthly Trend (Jan–Dec)
- **Export to Excel** button — downloads `.xlsx` file with 13 columns

### Excel Export Columns
| # | Column                | Source Field            |
|---|-----------------------|-------------------------|
| 1 | Sl.No                 | slNo                    |
| 2 | Branch                | branchName              |
| 3 | Branch Code           | branchCode              |
| 4 | Finding Area          | findingArea             |
| 5 | Finding Details       | findingDetails          |
| 6 | Risk Rating           | riskRating              |
| 7 | No. of Instances      | noOfInstances           |
| 8 | Rectification Status  | rectificationStatus     |
| 9 | Rectification Remarks | rectificationRemarks    |
|10 | Rectified At          | rectifiedAt             |
|11 | Assigned Officer      | officerName             |
|12 | Year                  | year                    |
|13 | Created At            | createdAt               |

---

## 8. Security Design

- **JWT tokens** — 8-hour expiry, signed with HS256
- **BCrypt** — password hashing with salt (cost factor 10)
- **Role-based authorization** — enforced on every API endpoint via `[Authorize(Roles="...")]`
- **Officer data isolation** — FindingService filters by `AssignedOfficerId` when caller is a ComplianceOfficer
- **Unique constraints** — Username (Users), BranchCode (Branches), UserId+BranchId+Year (Assignments)
- **CORS** — restricted to `http://localhost:4200` (dev); update for production

---

## 9. How to Run

### Prerequisites
- .NET 9 SDK
- Node.js 18+ and npm
- dotnet-ef tool: `dotnet tool install --global dotnet-ef`

### Backend
```bash
cd BankAudit.API
dotnet run
# Runs on: http://localhost:5100
# Swagger:  http://localhost:5100/swagger
# Default login: admin / Admin@123
```

### Frontend
```bash
cd bank-audit-ui
npx ng serve
# Runs on: http://localhost:4200
```

### GitHub Repository
```
https://github.com/Jafrul-Taj/Complaince-Manager
```

---

## 10. Implementation Phases

### Phase 1 — Backend Foundation
- Project setup, NuGet packages
- Entities, Enums, AppDbContext
- EF Core migration, SQLite database
- DataSeeder (admin user)
- JWT authentication in Program.cs

### Phase 2 — Backend Business Logic
- All DTOs (request/response objects)
- Service interfaces + implementations
- ExceptionMiddleware
- All 6 controllers with role authorization

### Phase 3 — Angular Setup
- Angular 17 standalone project
- Angular Material, ApexCharts, SheetJS packages
- app.config.ts, app.routes.ts
- AuthService (signals-based state)
- JWT interceptor, Auth guard, Role guard
- All core models and HTTP services

### Phase 4 — Angular UI
- Login page
- Main layout (mat-sidenav) + Sidebar
- User management (Operator)
- Branch management (Operator)
- Assignment manager (Operator)
- Findings list + form + rectify modal (Officer)
- Dashboard with charts + Excel export (Head)

---

## 11. Future Enhancements (Not in Scope)
- Email notifications on finding assignment
- Audit trail / change history
- PDF report generation
- Role: Branch Manager (read-only view of their branch)
- Role: Auditor / Team Leader
- Import findings from Excel bulk upload
- Multi-year comparison charts
