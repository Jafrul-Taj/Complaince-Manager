import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FindingService } from '../../../core/services/finding.service';
import { AuditFinding } from '../../../core/models/finding.model';
import { FindingFormComponent } from '../finding-form/finding-form.component';
import { RectifyModalComponent } from '../rectify-modal/rectify-modal.component';
import { FindingDetailModalComponent } from '../finding-detail-modal/finding-detail-modal.component';

@Component({
  selector: 'app-findings-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './findings-list.component.html',
  styleUrl: './findings-list.component.css'
})
export class FindingsListComponent implements OnInit, AfterViewInit {
  columns = ['select', 'slNo', 'branch', 'findingArea', 'nameOfCustomers', 'findingDetails',
             'lapsesOriginated', 'category', 'riskRating', 'complianceStatus', 'auditBaseDate', 'actions'];

  dataSource = new MatTableDataSource<AuditFinding>([]);
  allFindings: AuditFinding[] = [];

  reportId: number | null = null;
  branchId: number | null = null;
  selectedYear: number | null = null;

  searchTerm = '';
  riskFilter = '';
  statusFilter = '';

  selectedIds = new Set<number>();

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
      this.reportId  = params['reportId']  ? +params['reportId']  : null;
      this.branchId  = params['branchId']  ? +params['branchId']  : null;
      this.selectedYear = params['year']   ? +params['year']      : null;
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
      this.selectedIds.clear();
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

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyLocalFilter();
  }

  onRiskChange(event: Event) {
    this.riskFilter = (event.target as HTMLSelectElement).value;
    this.applyLocalFilter();
  }

  onStatusChange(event: Event) {
    this.statusFilter = (event.target as HTMLSelectElement).value;
    this.applyLocalFilter();
  }

  applyLocalFilter() {
    let filtered = this.allFindings;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.slNo.toLowerCase().includes(term) ||
        f.branchName.toLowerCase().includes(term) ||
        f.findingArea.toLowerCase().includes(term) ||
        f.nameOfCustomers.toLowerCase().includes(term) ||
        f.findingDetails.toLowerCase().includes(term) ||
        f.category.toLowerCase().includes(term) ||
        f.lapsesOriginated.toLowerCase().includes(term) ||
        f.officerName.toLowerCase().includes(term) ||
        (f.auditLeaderName || '').toLowerCase().includes(term)
      );
    }
    if (this.riskFilter)   filtered = filtered.filter(f => f.riskRating === this.riskFilter);
    if (this.statusFilter) filtered = filtered.filter(f => f.complianceStatus === this.statusFilter);

    this.dataSource.data = filtered;
  }

  // ── Summary getters ──────────────────────────────────────────────
  get headerFinding(): AuditFinding | undefined { return this.allFindings[0]; }
  get totalCount()    { return this.allFindings.length; }
  get criticalCount() { return this.allFindings.filter(f => f.riskRating === 'Critical').length; }
  get highCount()     { return this.allFindings.filter(f => f.riskRating === 'High').length; }
  get mediumCount()   { return this.allFindings.filter(f => f.riskRating === 'Medium').length; }
  get lowCount()      { return this.allFindings.filter(f => f.riskRating === 'Low').length; }
  get rectifiedCount(){ return this.allFindings.filter(f => f.complianceStatus === 'Rectified').length; }

  // ── Bulk select ──────────────────────────────────────────────────
  toggleSelect(id: number) {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
  }

  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedIds.clear();
    } else {
      this.dataSource.data.forEach(f => this.selectedIds.add(f.id));
    }
  }

  isAllSelected(): boolean {
    const rows = this.dataSource.data;
    return rows.length > 0 && rows.every(f => this.selectedIds.has(f.id));
  }

  bulkDelete() {
    const count = this.selectedIds.size;
    if (!confirm(`Delete ${count} selected finding(s)?`)) return;
    const ids = [...this.selectedIds];
    let done = 0;
    ids.forEach(id => {
      this.findingSvc.delete(id).subscribe({
        next: () => { done++; if (done === ids.length) { this.snack.open(`Deleted ${count} findings`, 'OK', { duration: 3000 }); this.load(); } },
        error: () => { done++; if (done === ids.length) { this.snack.open('Some deletions failed', 'OK', { duration: 3000 }); this.load(); } }
      });
    });
  }

  // ── Dialogs ──────────────────────────────────────────────────────
  openDetail(finding: AuditFinding) {
    this.dialog.open(FindingDetailModalComponent, {
      width: '680px',
      maxHeight: '90vh',
      data: { finding }
    });
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
    if (!confirm(`Delete finding "${f.slNo}"?`)) return;
    this.findingSvc.delete(f.id).subscribe({
      next: () => { this.snack.open('Finding deleted', 'OK', { duration: 3000 }); this.load(); },
      error: () => this.snack.open('Delete failed', 'OK', { duration: 3000 })
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────
  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB'); // dd/MM/yyyy
  }

  truncate(text: string, len: number): string {
    return text.length > len ? text.slice(0, len) + '…' : text;
  }

  statusDotClass(s: string): string {
    if (s === 'Rectified') return 'green';
    if (s === 'Unrectified') return 'red';
    return 'amber';
  }
}
