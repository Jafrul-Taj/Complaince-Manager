import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService } from '../../core/services/dashboard.service';
import { BranchService } from '../../core/services/branch.service';
import { Branch } from '../../core/models/branch.model';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface KpiCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatSelectModule,
    MatIconModule, MatFormFieldModule, MatProgressSpinnerModule,
    MatDividerModule, NgApexchartsModule
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <h1>Compliance Dashboard</h1>
        <div class="header-controls">
          <mat-form-field appearance="outline" style="width:120px">
            <mat-label>Year</mat-label>
            <mat-select [(value)]="selectedYear" (selectionChange)="loadAll()">
              @for (y of years; track y) {
                <mat-option [value]="y">{{ y }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width:200px">
            <mat-label>Branch</mat-label>
            <mat-select [(value)]="selectedBranchId" (selectionChange)="loadExport()">
              <mat-option [value]="null">All Branches</mat-option>
              @for (b of branches; track b.id) {
                <mat-option [value]="b.id">{{ b.branchName }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <button mat-raised-button color="accent" (click)="exportExcel()" [disabled]="exportData.length === 0">
            <mat-icon>download</mat-icon> Export Excel
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="loading-center">
          <mat-spinner diameter="48" />
          <p>Loading dashboard...</p>
        </div>
      } @else {
        <!-- KPI Cards -->
        <div class="kpi-grid">
          @for (kpi of kpis; track kpi.label) {
            <mat-card class="kpi-card" [style.border-left-color]="kpi.color">
              <mat-card-content>
                <div class="kpi-top">
                  <div class="kpi-icon" [style.background-color]="kpi.bgColor">
                    <mat-icon [style.color]="kpi.color">{{ kpi.icon }}</mat-icon>
                  </div>
                  <div class="kpi-value">{{ kpi.value }}</div>
                </div>
                <div class="kpi-label">{{ kpi.label }}</div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <!-- Charts Row 1 -->
        <div class="charts-row">
          <mat-card class="chart-card">
            <mat-card-title>Risk Distribution</mat-card-title>
            <mat-divider />
            <mat-card-content>
              <apx-chart
                [series]="riskChart.series"
                [chart]="riskChart.chart"
                [labels]="riskChart.labels"
                [colors]="riskChart.colors"
                [legend]="riskChart.legend"
                [plotOptions]="riskChart.plotOptions"
                [dataLabels]="riskChart.dataLabels">
              </apx-chart>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-title>Rectification Status</mat-card-title>
            <mat-divider />
            <mat-card-content>
              <apx-chart
                [series]="statusChart.series"
                [chart]="statusChart.chart"
                [xaxis]="statusChart.xaxis"
                [colors]="statusChart.colors"
                [plotOptions]="statusChart.plotOptions"
                [dataLabels]="statusChart.dataLabels">
              </apx-chart>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Charts Row 2 -->
        <div class="charts-row">
          <mat-card class="chart-card chart-wide">
            <mat-card-title>Branch-wise Findings</mat-card-title>
            <mat-divider />
            <mat-card-content>
              <apx-chart
                [series]="branchChart.series"
                [chart]="branchChart.chart"
                [xaxis]="branchChart.xaxis"
                [colors]="branchChart.colors"
                [plotOptions]="branchChart.plotOptions"
                [dataLabels]="branchChart.dataLabels">
              </apx-chart>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-title>Monthly Trend ({{ selectedYear }})</mat-card-title>
            <mat-divider />
            <mat-card-content>
              <apx-chart
                [series]="trendChart.series"
                [chart]="trendChart.chart"
                [xaxis]="trendChart.xaxis"
                [stroke]="trendChart.stroke"
                [markers]="trendChart.markers"
                [colors]="trendChart.colors">
              </apx-chart>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .header-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .loading-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px;
      gap: 16px;
      color: #666;
    }
    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      border-left: 4px solid;
      border-radius: 8px !important;
    }
    .kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .kpi-icon {
      width: 40px; height: 40px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .kpi-value { font-size: 28px; font-weight: 700; color: #333; }
    .kpi-label { font-size: 13px; color: #666; font-weight: 500; }
    /* Charts */
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    .chart-card { border-radius: 8px !important; }
    .chart-card mat-card-title { padding: 16px 16px 8px; font-size: 16px; }
    .chart-card mat-card-content { padding: 8px; }
    .chart-wide { grid-column: span 1; }
    @media (max-width: 1024px) {
      .charts-row { grid-template-columns: 1fr; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashSvc = inject(DashboardService);
  private branchSvc = inject(BranchService);

  selectedYear = new Date().getFullYear();
  selectedBranchId: number | null = null;
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  branches: Branch[] = [];
  loading = false;

  kpis: KpiCard[] = [];
  exportData: any[] = [];

  riskChart: any = {};
  statusChart: any = {};
  branchChart: any = {};
  trendChart: any = {};

  ngOnInit() {
    this.branchSvc.getAll().subscribe(b => this.branches = b);
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    const y = this.selectedYear;

    Promise.all([
      this.dashSvc.getKpis(y).toPromise(),
      this.dashSvc.getRiskDistribution(y).toPromise(),
      this.dashSvc.getStatusBreakdown(y).toPromise(),
      this.dashSvc.getBranchSummary(y).toPromise(),
      this.dashSvc.getMonthlyTrend(y).toPromise()
    ]).then(([kpis, risk, status, branch, trend]) => {
      this.buildKpis(kpis);
      this.buildRiskChart(risk ?? []);
      this.buildStatusChart(status ?? []);
      this.buildBranchChart(branch ?? []);
      this.buildTrendChart(trend ?? []);
      this.loading = false;
      this.loadExport();
    }).catch(() => { this.loading = false; });
  }

  loadExport() {
    this.dashSvc.getExportData(this.selectedYear, this.selectedBranchId ?? undefined)
      .subscribe(data => this.exportData = data);
  }

  private buildKpis(data: any) {
    if (!data) return;
    this.kpis = [
      { label: 'Total Findings', value: data.totalFindings, icon: 'assignment', color: '#c62828', bgColor: '#ffebee' },
      { label: 'Critical', value: data.criticalCount, icon: 'warning', color: '#b71c1c', bgColor: '#ffcdd2' },
      { label: 'High Risk', value: data.highCount, icon: 'priority_high', color: '#e65100', bgColor: '#fff3e0' },
      { label: 'Rectified', value: data.rectifiedCount, icon: 'task_alt', color: '#2e7d32', bgColor: '#e8f5e9' },
      { label: 'Pending', value: data.pendingCount, icon: 'pending', color: '#616161', bgColor: '#eeeeee' },
      { label: 'Rectification Rate', value: data.rectificationRate + '%', icon: 'trending_up', color: '#7f1d1d', bgColor: '#fce4ec' }
    ];
  }

  private buildRiskChart(data: any[]) {
    if (!data?.length) { this.riskChart = this.emptyChart('donut'); return; }
    this.riskChart = {
      series: data.map(d => d.count),
      labels: data.map(d => d.riskRating),
      colors: ['#4caf50', '#ff9800', '#f44336', '#9c27b0'],
      chart: { type: 'donut', height: 300 },
      legend: { position: 'bottom' },
      plotOptions: { pie: { donut: { size: '60%' } } },
      dataLabels: { enabled: true }
    };
  }

  private buildStatusChart(data: any[]) {
    if (!data?.length) { this.statusChart = this.emptyChart('bar'); return; }
    const labels: { [key: string]: string } = { Pending: 'Pending', InProgress: 'In Progress', Rectified: 'Rectified' };
    this.statusChart = {
      series: [{ name: 'Findings', data: data.map(d => d.count) }],
      chart: { type: 'bar', height: 300 },
      xaxis: { categories: data.map(d => labels[d.status] || d.status) },
      colors: ['#c62828'],
      plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
      dataLabels: { enabled: true }
    };
  }

  private buildBranchChart(data: any[]) {
    if (!data?.length) { this.branchChart = this.emptyChart('bar'); return; }
    this.branchChart = {
      series: [{ name: 'Total Findings', data: data.map(d => d.totalFindings) }],
      chart: { type: 'bar', height: 350 },
      xaxis: { categories: data.map(d => d.branchName) },
      colors: ['#991b1b'],
      plotOptions: { bar: { borderRadius: 4, horizontal: true } },
      dataLabels: { enabled: true }
    };
  }

  private buildTrendChart(data: any[]) {
    if (!data?.length) { this.trendChart = this.emptyChart('line'); return; }
    this.trendChart = {
      series: [{ name: 'New Findings', data: data.map(d => d.count) }],
      chart: { type: 'line', height: 300, toolbar: { show: false } },
      xaxis: { categories: data.map(d => d.month) },
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 5 },
      colors: ['#00897b']
    };
  }

  private emptyChart(type: string) {
    return { series: [], chart: { type, height: 300 }, labels: [] };
  }

  exportExcel() {
    if (!this.exportData.length) return;

    const rows = this.exportData.map((f: any) => ({
      'Sl.No': f.slNo,
      'Branch': f.branchName,
      'Branch Code': f.branchCode,
      'Finding Area': f.findingArea,
      'Finding Details': f.findingDetails,
      'Risk Rating': f.riskRating,
      'No. of Instances': f.noOfInstances,
      'Rectification Status': f.rectificationStatus === 'InProgress' ? 'In Progress' : f.rectificationStatus,
      'Rectification Remarks': f.rectificationRemarks ?? '',
      'Rectified At': f.rectifiedAt ? new Date(f.rectifiedAt).toLocaleDateString() : '',
      'Assigned Officer': f.officerName,
      'Year': f.year,
      'Created At': new Date(f.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 8 }, { wch: 22 }, { wch: 12 }, { wch: 20 }, { wch: 45 },
      { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 35 }, { wch: 15 },
      { wch: 22 }, { wch: 6 }, { wch: 15 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Audit_${this.selectedYear}`);
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `AuditFindings_${this.selectedYear}.xlsx`);
  }
}
