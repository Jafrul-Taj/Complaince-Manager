import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatButtonModule, MatDividerModule],
  template: `
    <div class="sidebar-wrap">
      <div class="sidebar-header">
        <mat-icon class="logo-icon">account_balance</mat-icon>
        <span class="logo-text">Bank Audit</span>
      </div>

      <div class="user-info">
        <mat-icon class="user-avatar">account_circle</mat-icon>
        <div class="user-details">
          <div class="user-name">{{ auth.fullName() }}</div>
          <div class="user-role">{{ formatRole(auth.role()) }}</div>
        </div>
      </div>

      <mat-divider style="border-top-color: rgba(255,255,255,0.2); margin: 8px 0" />

      <mat-nav-list>
        @for (item of visibleNavItems(); track item.route) {
          <a mat-list-item
             [routerLink]="item.route"
             routerLinkActive="active-link"
             class="nav-item">
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </a>
        }
      </mat-nav-list>

      <div class="sidebar-footer">
        <button mat-button class="logout-btn" (click)="auth.logout()">
          <mat-icon>logout</mat-icon>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-wrap {
      height: 100%;
      display: flex;
      flex-direction: column;
      color: white;
    }
    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px 16px;
      font-size: 18px;
      font-weight: 600;
      border-bottom: 2px solid #c62828;
    }
    .logo-icon { font-size: 28px; width: 28px; height: 28px; color: #ef5350; }
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
    }
    .user-avatar { font-size: 36px; width: 36px; height: 36px; opacity: 0.85; }
    .user-name { font-size: 14px; font-weight: 500; }
    .user-role { font-size: 11px; opacity: 0.7; margin-top: 2px; }
    .nav-item {
      color: rgba(255,255,255,0.85) !important;
      border-radius: 6px;
      margin: 2px 8px;
    }
    /* Pierce Angular Material MDC internals for list item text and icons */
    ::ng-deep .nav-item .mdc-list-item__primary-text {
      color: rgba(255,255,255,0.85) !important;
    }
    ::ng-deep .nav-item .mat-icon {
      color: rgba(255,255,255,0.65) !important;
    }
    ::ng-deep .active-link {
      background-color: rgba(198,40,40,0.35) !important;
      border-left: 3px solid #ef5350;
      color: white !important;
    }
    ::ng-deep .active-link .mdc-list-item__primary-text {
      color: white !important;
    }
    ::ng-deep .active-link .mat-icon {
      color: #ef5350 !important;
    }
    .sidebar-footer {
      margin-top: auto;
      padding: 12px 8px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .logout-btn {
      color: rgba(255,255,255,0.75) !important;
      width: 100%;
      display: flex;
      gap: 8px;
    }
    ::ng-deep .logout-btn .mdc-button__label {
      color: rgba(255,255,255,0.75) !important;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    ::ng-deep .logout-btn .mat-icon {
      color: rgba(255,255,255,0.75) !important;
    }
  `]
})
export class SidebarComponent {
  auth = inject(AuthService);

  private allNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/app/dashboard', roles: ['Operator', 'ComplianceHead'] },
    { label: 'Users', icon: 'people', route: '/app/users', roles: ['Operator'] },
    { label: 'Branches', icon: 'business', route: '/app/branches', roles: ['Operator'] },
    { label: 'Assignments', icon: 'assignment_ind', route: '/app/assignments', roles: ['Operator'] },
    { label: 'My Findings', icon: 'fact_check', route: '/app/findings', roles: ['ComplianceOfficer'] }
  ];

  visibleNavItems = computed(() => {
    const role = this.auth.role();
    return this.allNavItems.filter(item => role && item.roles.includes(role));
  });

  formatRole(role: string | null): string {
    switch (role) {
      case 'Operator':          return 'Operator';
      case 'ComplianceOfficer': return 'Compliance Officer';
      case 'ComplianceHead':    return 'Compliance Head';
      default:                  return role ?? '';
    }
  }
}
