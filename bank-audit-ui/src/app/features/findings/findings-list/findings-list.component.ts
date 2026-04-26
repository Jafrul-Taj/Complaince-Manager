import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { FindingService } from '../../../core/services/finding.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { AuthService } from '../../../core/services/auth.service';
import { AuditFinding } from '../../../core/models/finding.model';
import { Assignment } from '../../../core/models/assignment.model';
import { FindingFormComponent } from '../finding-form/finding-form.component';
import { RectifyModalComponent } from '../rectify-modal/rectify-modal.component';

@Component({
  selector: 'app-findings-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatButtonModule, MatIconModule, MatCardModule,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatSnackBarModule
  ],
  templateUrl: './findings-list.component.html',
  styleUrl: './findings-list.component.css'
})
export class FindingsListComponent implements OnInit, AfterViewInit {
  columns = ['slNo', 'branchName', 'findingArea', 'findingDetails', 'riskRating', 'rectificationStatus', 'year', 'actions'];
  dataSource = new MatTableDataSource<AuditFinding>([]);
  allFindings: AuditFinding[] = [];
  myAssignments: Assignment[] = [];

  selectedYear: number | null = new Date().getFullYear();
  selectedBranchId: number | null = null;
  riskFilter = '';
  statusFilter = '';

  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private findingSvc: FindingService,
    private assignSvc: AssignmentService,
    private auth: AuthService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    const uid = this.auth.userId();
    if (uid) {
      this.assignSvc.getByUser(uid).subscribe(a => this.myAssignments = a);
    }
    this.load();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  load() {
    this.findingSvc.getAll(
      this.selectedYear ?? undefined,
      this.selectedBranchId ?? undefined
    ).subscribe(findings => {
      this.allFindings = findings;
      this.applyLocalFilter();
    });
  }

  applyLocalFilter() {
    let filtered = this.allFindings;
    if (this.riskFilter) filtered = filtered.filter(f => f.riskRating === this.riskFilter);
    if (this.statusFilter) filtered = filtered.filter(f => f.rectificationStatus === this.statusFilter);
    this.dataSource.data = filtered;
  }

  openForm(finding?: AuditFinding) {
    const ref = this.dialog.open(FindingFormComponent, {
      width: '620px',
      data: { finding, assignments: this.myAssignments }
    });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  openRectify(finding: AuditFinding) {
    const ref = this.dialog.open(RectifyModalComponent, {
      width: '480px',
      data: { finding }
    });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  delete(f: AuditFinding) {
    if (!confirm(`Delete finding "${f.slNo} — ${f.findingArea}"?`)) return;
    this.findingSvc.delete(f.id).subscribe({
      next: () => { this.snack.open('Finding deleted', 'OK', { duration: 3000 }); this.load(); },
      error: () => this.snack.open('Delete failed', 'OK', { duration: 3000 })
    });
  }

  statusClass(s: string) {
    switch (s) {
      case 'Pending':    return 'chip-pending';
      case 'InProgress': return 'chip-inprogress';
      case 'Rectified':  return 'chip-rectified';
      default: return '';
    }
  }

  formatStatus(s: string) {
    return s === 'InProgress' ? 'In Progress' : s;
  }
}
