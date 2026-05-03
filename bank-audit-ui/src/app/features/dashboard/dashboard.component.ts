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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
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
      'Compliance Status': f.complianceStatus,
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
