import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    title: 'Login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
