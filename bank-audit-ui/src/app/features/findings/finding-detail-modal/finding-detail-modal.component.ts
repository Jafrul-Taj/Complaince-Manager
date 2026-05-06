import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuditFinding } from '../../../core/models/finding.model';

@Component({
  selector: 'app-finding-detail-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './finding-detail-modal.component.html',
  styleUrl: './finding-detail-modal.component.css'
})
export class FindingDetailModalComponent {
  f: AuditFinding;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { finding: AuditFinding },
    public ref: MatDialogRef<FindingDetailModalComponent>
  ) {
    this.f = data.finding;
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB');
  }

  riskClass(r: string) {
    return 'risk-' + r.toLowerCase();
  }

  statusClass(s: string) {
    return s === 'Rectified' ? 'status-done' : 'status-pending';
  }
}
