import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
import { ReactiveFormsModule } from '@angular/forms';
import { FindingService } from '../../../core/services/finding.service';
import { AuditFinding } from '../../../core/models/finding.model';
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

  reportId: number | null = null;
  branchId: number | null = null;
  selectedYear: number | null = null;
  riskFilter = '';
  statusFilter = '';

  reportLabel = '';
  branchLabel = '';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private findingSvc: FindingService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.reportId = params['reportId'] ? +params['reportId'] : null;
      this.branchId = params['branchId'] ? +params['branchId'] : null;
      this.selectedYear = params['year'] ? +params['year'] : null;
      this.load();
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  load() {
    this.findingSvc.getAll(
      this.selectedYear ?? undefined,
      this.branchId ?? undefined,
      this.reportId ?? undefined
    ).subscribe(findings => {
      this.allFindings = findings;
      this.applyLocalFilter();
    });
  }

  goBack() {
    if (this.reportId !== null) {
      const params: any = {};
      if (this.branchId) params['branchId'] = this.branchId;
      this.router.navigate(['/app/audit-reports'], { queryParams: params });
    } else {
      this.router.navigate(['/app/my-assignments']);
    }
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
      data: { finding, reportId: finding?.complianceAuditReportId ?? this.reportId }
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
