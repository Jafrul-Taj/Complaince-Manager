import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService, FilterParams } from '../../../core/services/dashboard.service';
import { FindingService } from '../../../core/services/finding.service';
import { FindingDetailModalComponent } from '../finding-detail-modal/finding-detail-modal.component';
import { FindingFormComponent } from '../finding-form/finding-form.component';
import { RectifyModalComponent } from '../rectify-modal/rectify-modal.component';

@Component({
  selector: 'app-findings-detail-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule,
    MatTooltipModule, MatProgressSpinnerModule
  ],
  templateUrl: './findings-detail-list.component.html',
  styleUrl: './findings-detail-list.component.css'
})
export class FindingsDetailListComponent implements OnInit, AfterViewInit {
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private dashSvc    = inject(DashboardService);
  private findingSvc = inject(FindingService);
  private dialog     = inject(MatDialog);
  private snack      = inject(MatSnackBar);

  columns = [
    'slNo', 'branch', 'officer', 'year', 'findingArea',
    'nameOfCustomers', 'findingDetails', 'lapsesOriginated',
    'category', 'riskRating', 'complianceStatus', 'auditBaseDate'
  ];

  dataSource   = new MatTableDataSource<any>([]);
  allFindings: any[] = [];
  loading      = false;

  focusType    = '';
  focusLabel   = '';
  focusId?:    number;
  focusValue?: string;
  filterParams: FilterParams = {};

  searchTerm   = '';
  riskFilter   = '';
  statusFilter = '';

  @ViewChild(MatSort)      sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.focusType  = params['focusType']  ?? '';
      this.focusLabel = params['focusLabel'] ?? '';
      this.focusId    = params['focusId']    ? +params['focusId'] : undefined;
      this.focusValue = params['focusValue'] ?? undefined;

      this.filterParams = {
        years:       params['years']       ? params['years'].split(',').map(Number)       : undefined,
        branchIds:   params['branchIds']   ? params['branchIds'].split(',').map(Number)   : undefined,
        areas:       params['areas']       ? params['areas'].split(',')                   : undefined,
        riskRatings: params['riskRatings'] ? params['riskRatings'].split(',')             : undefined,
        statuses:    params['statuses']    ? params['statuses'].split(',')                : undefined,
        officerIds:  params['officerIds']  ? params['officerIds'].split(',').map(Number)  : undefined,
        lapsesTypes: params['lapsesTypes'] ? params['lapsesTypes'].split(',')             : undefined,
      };
      this.load();
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort      = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  load() {
    this.loading = true;
    this.dashSvc.getFindingsByFilter(
      this.filterParams,
      this.focusType  || undefined,
      this.focusId,
      this.focusValue
    ).subscribe({
      next: data => {
        this.allFindings = data;
        this.applyLocalFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyLocalFilter() {
    let filtered = this.allFindings;
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        (f.slNo            ?? '').toLowerCase().includes(t) ||
        (f.branchName      ?? '').toLowerCase().includes(t) ||
        (f.officerName     ?? '').toLowerCase().includes(t) ||
        (f.findingArea     ?? '').toLowerCase().includes(t) ||
        (f.nameOfCustomers ?? '').toLowerCase().includes(t) ||
        (f.findingDetails  ?? '').toLowerCase().includes(t) ||
        (f.category        ?? '').toLowerCase().includes(t)
      );
    }
    if (this.riskFilter)   filtered = filtered.filter(f => f.riskRating      === this.riskFilter);
    if (this.statusFilter) filtered = filtered.filter(f => f.complianceStatus === this.statusFilter);
    this.dataSource.data = filtered;
  }

  onSearch(e: Event)       { this.searchTerm   = (e.target as HTMLInputElement).value;  this.applyLocalFilter(); }
  onRiskChange(e: Event)   { this.riskFilter   = (e.target as HTMLSelectElement).value; this.applyLocalFilter(); }
  onStatusChange(e: Event) { this.statusFilter = (e.target as HTMLSelectElement).value; this.applyLocalFilter(); }

  goBack() { this.router.navigate(['/app/dashboard']); }

  get totalCount()     { return this.allFindings.length; }
  get highCount()      { return this.allFindings.filter(f => f.riskRating === 'High').length; }
  get mediumCount()    { return this.allFindings.filter(f => f.riskRating === 'Medium').length; }
  get lowCount()       { return this.allFindings.filter(f => f.riskRating === 'Low').length; }
  get rectifiedCount() { return this.allFindings.filter(f => f.complianceStatus === 'Rectified').length; }

  openDetail(f: any) {
    this.dialog.open(FindingDetailModalComponent, {
      width: '680px', maxHeight: '90vh', data: { finding: f }
    });
  }

  openForm(f: any) {
    const ref = this.dialog.open(FindingFormComponent, {
      width: '620px',
      data: { finding: f, reportId: f.complianceAuditReportId ?? null }
    });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  openRectify(f: any) {
    const ref = this.dialog.open(RectifyModalComponent, {
      width: '480px', data: { finding: f }
    });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  delete(f: any) {
    if (!confirm(`Delete finding "${f.slNo}"?`)) return;
    this.findingSvc.delete(f.id).subscribe({
      next: () => { this.snack.open('Deleted', 'OK', { duration: 3000 }); this.load(); },
      error: () => this.snack.open('Delete failed', 'OK', { duration: 3000 })
    });
  }

  exportCsv() {
    const rows = this.dataSource.data;
    if (!rows.length) return;
    const headers = [
      'Sl No', 'Branch', 'Branch Code', 'Officer', 'Audit Leader', 'Year',
      'Area', 'Category', 'Lapses Type', 'Instances', 'Risk', 'Status',
      'Audit Date', 'Rectified At', 'Customers', 'Lapses Originated',
      'Finding Details', 'Rectification Remarks'
    ];
    const esc  = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [
      headers.map(esc).join(','),
      ...rows.map(f => [
        f.slNo, f.branchName, f.branchCode, f.officerName, f.auditLeaderName, f.year,
        f.findingArea, f.category, f.lapsesType, f.noOfInstances, f.riskRating,
        f.complianceStatus, this.formatDate(f.auditBaseDate), this.formatDate(f.rectifiedAt),
        f.nameOfCustomers, f.lapsesOriginated, f.findingDetails, f.rectificationRemarks
      ].map(esc).join(','))
    ];
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `findings-${this.focusType}-${this.focusLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-GB');
  }

  truncate(text: string, len: number): string {
    if (!text) return '';
    return text.length > len ? text.slice(0, len) + '…' : text;
  }

  statusDotClass(s: string): string {
    if (s === 'Rectified')   return 'green';
    if (s === 'Unrectified') return 'red';
    return 'amber';
  }
}
