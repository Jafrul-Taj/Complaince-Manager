import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-detail-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './user-detail-modal.component.html',
  styleUrl: './user-detail-modal.component.css'
})
export class UserDetailModalComponent {
  constructor(
    public dialogRef: MatDialogRef<UserDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {}

  get user(): User { return this.data.user; }

  formatRole(role: string): string {
    const map: Record<string, string> = {
      Operator: 'Operator',
      ComplianceOfficer: 'Compliance Officer',
      ComplianceHead: 'Compliance Head'
    };
    return map[role] ?? role;
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
