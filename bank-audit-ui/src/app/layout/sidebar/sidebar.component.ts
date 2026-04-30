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
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  auth = inject(AuthService);

  private allNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/app/dashboard', roles: ['Operator', 'ComplianceHead'] },
    { label: 'Users', icon: 'people', route: '/app/users', roles: ['Operator'] },
    { label: 'Branches', icon: 'business', route: '/app/branches', roles: ['Operator'] },
    { label: 'Assignments', icon: 'assignment_ind', route: '/app/assignments', roles: ['Operator'] },
    { label: 'My Assignments', icon: 'assignment', route: '/app/my-assignments', roles: ['ComplianceOfficer'] }
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
