import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
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
        loadComponent: () =>
          import('./features/users/user-list/user-list.component').then(m => m.UserListComponent),
        canActivate: [roleGuard],
        data: { roles: ['Operator'] }
      },
      {
        path: 'branches',
        loadComponent: () =>
          import('./features/branches/branch-list/branch-list.component').then(m => m.BranchListComponent),
        canActivate: [roleGuard],
        data: { roles: ['Operator'] }
      },
      {
        path: 'assignments',
        loadComponent: () =>
          import('./features/assignments/assignment-manager/assignment-manager.component').then(m => m.AssignmentManagerComponent),
        canActivate: [roleGuard],
        data: { roles: ['Operator'] }
      },
      {
        path: 'findings',
        loadComponent: () =>
          import('./features/findings/findings-list/findings-list.component').then(m => m.FindingsListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ComplianceOfficer'] }
      },
      {
        path: 'dashboard',
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
