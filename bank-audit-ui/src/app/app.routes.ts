import { Routes } from '@angular/router';
import { authGuard }       from './core/guards/auth.guard';
import { roleGuard }       from './core/guards/role.guard';
import { loggedInGuard }   from './core/guards/logged-in.guard';
import { preventBackGuard } from './core/guards/prevent-back.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ── Public: login ─────────────────────────────────────────────────────────
  // loggedInGuard redirects already-authenticated users back to their home page
  // so the login screen is never shown while a valid session exists.
  {
    path: 'login',
    title: 'Login',
    canActivate: [loggedInGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // ── Protected: entire /app tree ───────────────────────────────────────────
  // canActivate:   authGuard   → redirects unauthenticated users to /login
  // canDeactivate: preventBackGuard → shows confirmation dialog when the
  //                browser back-button (or any navigation) tries to leave
  //                /app/** entirely (e.g. land on /login or an external URL).
  //                Does NOT fire for navigation between /app/* child routes.
  {
    path: 'app',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate:   [authGuard],
    canDeactivate: [preventBackGuard],
    children: [
      {
        path: 'users',
        title: 'User Management',
        loadComponent: () =>
          import('./features/users/user-list/user-list.component').then(m => m.UserListComponent),
        canActivate: [roleGuard],
        data: { roles: ['Operator'] }
      },
      {
        path: 'branches',
        title: 'Branch Management',
        loadComponent: () =>
          import('./features/branches/branch-list/branch-list.component').then(m => m.BranchListComponent),
        canActivate: [roleGuard],
        data: { roles: ['Operator'] }
      },
      {
        path: 'assignments',
        title: 'Assignments',
        loadComponent: () =>
          import('./features/assignments/assignment-manager/assignment-manager.component').then(m => m.AssignmentManagerComponent),
        canActivate: [roleGuard],
        data: { roles: ['Operator'] }
      },
      {
        path: 'my-assignments',
        title: 'My Branches',
        loadComponent: () =>
          import('./features/my-assignments/my-assignments.component').then(m => m.MyAssignmentsComponent),
        canActivate: [roleGuard],
        data: { roles: ['ComplianceOfficer'] }
      },
      {
        path: 'audit-reports',
        title: 'Audit Reports',
        loadComponent: () =>
          import('./features/audit-reports/audit-reports.component').then(m => m.AuditReportsComponent),
        canActivate: [roleGuard],
        data: { roles: ['ComplianceOfficer'] }
      },
      {
        path: 'findings',
        title: 'Findings',
        loadComponent: () =>
          import('./features/findings/findings-list/findings-list.component').then(m => m.FindingsListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ComplianceOfficer', 'ComplianceHead', 'Operator'] }
      },
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['ComplianceHead', 'Operator'] }
      },
      {
        path: 'findings-detail',
        title: 'Finding Details',
        loadComponent: () =>
          import('./features/findings/findings-detail-list/findings-detail-list.component').then(m => m.FindingsDetailListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ComplianceHead', 'Operator'] }
      },
      {
        path: 'excel-upload',
        title: 'Import Excel',
        loadComponent: () =>
          import('./features/excel-upload/excel-upload.component').then(m => m.ExcelUploadComponent),
        canActivate: [roleGuard],
        data: { roles: ['Operator'] }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Catch-all: unknown paths → login (loggedInGuard will redirect if authed)
  { path: '**', redirectTo: 'login' }
];
