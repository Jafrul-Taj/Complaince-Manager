import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { NgApexchartsModule } from 'ng-apexcharts';
import { forkJoin } from 'rxjs';
import { DashboardService, FilterParams } from '../../core/services/dashboard.service';
import { BranchService } from '../../core/services/branch.service';
import { Branch } from '../../core/models/branch.model';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatProgressSpinnerModule,
    MatTabsModule, NgApexchartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private dashSvc = inject(DashboardService);
  private branchSvc = inject(BranchService);

  years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  branches: Branch[] = [];
  officers: any[] = [];
  areas: string[] = [];

  filters = {
    year: new Date().getFullYear(),
    branchId: 0,
    area: '',
    riskRating: '',
    complianceStatus: '',
    officerId: 0
  };

  branchSearch = '';
  categorySearch = '';

  loading = false;
  kpis: any = null;

  riskChart: any = {};
  statusChart: any = {};
  trendChart: any = {};
  branchChart: any = {};
  yearChart: any = {};
  officerChart: any = {};

  branchSummary: any[] = [];
  officerSummary: any[] = [];
  yearComparison: any[] = [];
  areaBreakdown: any[] = [];
  categoryBreakdown: any[] = [];
  exportData: any[] = [];

  get filterParams(): FilterParams {
    return {
      year: this.filters.year || null,
      branchId: this.filters.branchId || null,
      area: this.filters.area || null,
      riskRating: this.filters.riskRating || null,
      complianceStatus: this.filters.complianceStatus || null,
      officerId: this.filters.officerId || null
    };
  }

  get filteredBranchSummary(): any[] {
    if (!this.branchSearch.trim()) return this.branchSummary;
    const s = this.branchSearch.toLowerCase();
    return this.branchSummary.filter(b => b.branchName.toLowerCase().includes(s));
  }

  get filteredCategoryBreakdown(): any[] {
    if (!this.categorySearch.trim()) return this.categoryBreakdown;
    const s = this.categorySearch.toLowerCase();
    return this.categoryBreakdown.filter(c => c.category.toLowerCase().includes(s));
  }

  ngOnInit() {
    this.branchSvc.getAll().subscribe(b => this.branches = b);
    this.dashSvc.getOfficers().subscribe(o => this.officers = o);
    this.dashSvc.getAreaBreakdown({}).subscribe(data => {
      this.areas = data.map((a: any) => a.area).filter(Boolean).sort();
    });
    this.loadAll();
  }

  applyFilters() { this.loadAll(); }

  resetFilters() {
    this.filters = { year: new Date().getFullYear(), branchId: 0, area: '', riskRating: '', complianceStatus: '', officerId: 0 };
    this.branchSearch = '';
    this.categorySearch = '';
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    const fp = this.filterParams;

    forkJoin({
      kpis:     this.dashSvc.getKpis(fp),
      risk:     this.dashSvc.getRiskDistribution(fp),
      status:   this.dashSvc.getStatusBreakdown(fp),
      trend:    this.dashSvc.getMonthlyTrend(fp),
      branch:   this.dashSvc.getBranchSummary(fp),
      year:     this.dashSvc.getYearComparison(fp),
      officer:  this.dashSvc.getOfficerSummary(fp),
      area:     this.dashSvc.getAreaBreakdown(fp),
      category: this.dashSvc.getCategoryBreakdown(fp, 50),
      export:   this.dashSvc.getExportData(fp)
    }).subscribe({
      next: (data) => {
        this.kpis = data.kpis;
        this.buildRiskChart(data.risk ?? []);
        this.buildStatusChart(data.status ?? []);
        this.buildTrendChart(data.trend ?? []);
        this.buildBranchChart(data.branch ?? []);
        this.buildYearChart(data.year ?? []);
        this.buildOfficerChart(data.officer ?? []);
        this.branchSummary  = data.branch ?? [];
        this.officerSummary = data.officer ?? [];
        this.yearComparison = data.year ?? [];
        this.areaBreakdown  = data.area ?? [];
        this.categoryBreakdown = data.category ?? [];
        this.exportData     = data.export ?? [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private buildRiskChart(data: any[]) {
    const order = ['High', 'Medium', 'Low'];
    const sorted = order.map(r => data.find((d: any) => d.riskRating === r)).filter(Boolean);
    if (!sorted.length) { this.riskChart = this.emptyDonut(); return; }
    this.riskChart = {
      series: sorted.map((d: any) => d.count),
      chart: { type: 'donut', height: 260, toolbar: { show: false } },
      labels: sorted.map((d: any) => d.riskRating),
      colors: ['#dc2626', '#d97706', '#16a34a'],
      legend: { position: 'bottom', fontSize: '12px', fontFamily: 'Inter, sans-serif' },
      plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: 'Total', color: '#374151', fontFamily: 'Inter, sans-serif' } } } } },
      dataLabels: { enabled: true, formatter: (val: number) => val.toFixed(1) + '%', style: { fontSize: '11px' } },
      responsive: [{ breakpoint: 480, options: { chart: { height: 220 } } }]
    };
  }

  private buildStatusChart(data: any[]) {
    const colorMap: Record<string, string> = { Rectified: '#059669', Unrectified: '#dc2626', 'Partially Rectified': '#d97706' };
    const labelMap: Record<string, string> = { Rectified: 'Rectified', Unrectified: 'Unrectified', 'Partially Rectified': 'Partial' };
    if (!data.length) { this.statusChart = this.emptyBar(); return; }
    this.statusChart = {
      series: [{ name: 'Findings', data: data.map((d: any) => d.count) }],
      chart: { type: 'bar', height: 260, toolbar: { show: false } },
      xaxis: { categories: data.map((d: any) => labelMap[d.status] ?? d.status), labels: { style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' } } },
      colors: data.map((d: any) => colorMap[d.status] ?? '#6b7280'),
      plotOptions: { bar: { borderRadius: 5, columnWidth: '50%', distributed: true } },
      dataLabels: { enabled: true, style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' } },
      legend: { show: false }
    };
  }

  private buildTrendChart(data: any[]) {
    this.trendChart = {
      series: [{ name: 'New Findings', data: data.map((d: any) => d.count) }],
      chart: { type: 'area', height: 230, toolbar: { show: false } },
      xaxis: { categories: data.map((d: any) => d.month), labels: { style: { fontSize: '11px', fontFamily: 'Inter, sans-serif' } } },
      yaxis: { labels: { style: { fontSize: '11px' } } },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 } },
      stroke: { curve: 'smooth', width: 2.5 },
      markers: { size: 4, hover: { size: 6 } },
      colors: ['#c62828'],
      dataLabels: { enabled: false },
      tooltip: { y: { formatter: (v: number) => v + ' findings' } },
      grid: { borderColor: '#f0f0f0' }
    };
  }

  private buildBranchChart(data: any[]) {
    const top10 = data.slice(0, 10);
    if (!top10.length) { this.branchChart = this.emptyBar(); return; }
    this.branchChart = {
      series: [
        { name: 'High',   data: top10.map((d: any) => d.highCount) },
        { name: 'Medium', data: top10.map((d: any) => d.mediumCount) },
        { name: 'Low',    data: top10.map((d: any) => d.lowCount) }
      ],
      chart: { type: 'bar', height: 300, stacked: true, toolbar: { show: false } },
      xaxis: { categories: top10.map((d: any) => d.branchName), labels: { style: { fontSize: '10px', fontFamily: 'Inter, sans-serif' } } },
      colors: ['#dc2626', '#d97706', '#16a34a'],
      plotOptions: { bar: { horizontal: true, barHeight: '65%' } },
      dataLabels: { enabled: false },
      legend: { position: 'top', fontSize: '11px', fontFamily: 'Inter, sans-serif' },
      grid: { borderColor: '#f0f0f0' }
    };
  }

  private buildYearChart(data: any[]) {
    if (!data.length) { this.yearChart = this.emptyBar(); return; }
    this.yearChart = {
      series: [
        { name: 'Total',     data: data.map((d: any) => d.totalFindings) },
        { name: 'Rectified', data: data.map((d: any) => d.rectifiedCount) }
      ],
      chart: { type: 'bar', height: 250, toolbar: { show: false } },
      xaxis: { categories: data.map((d: any) => d.year.toString()), labels: { style: { fontSize: '11px', fontFamily: 'Inter, sans-serif' } } },
      colors: ['#c62828', '#059669'],
      plotOptions: { bar: { borderRadius: 4, columnWidth: '60%', grouped: true } },
      dataLabels: { enabled: false },
      legend: { position: 'top', fontSize: '11px', fontFamily: 'Inter, sans-serif' },
      grid: { borderColor: '#f0f0f0' }
    };
  }

  private buildOfficerChart(data: any[]) {
    const top8 = data.slice(0, 8);
    if (!top8.length) { this.officerChart = this.emptyBar(); return; }
    this.officerChart = {
      series: [{ name: 'Findings', data: top8.map((d: any) => d.totalFindings) }],
      chart: { type: 'bar', height: 250, toolbar: { show: false } },
      xaxis: {
        categories: top8.map((d: any) => {
          const parts = d.officerName.split(' ');
          return parts.length > 1 ? parts[0] + ' ' + parts[parts.length - 1] : d.officerName;
        }),
        labels: { style: { fontSize: '10px', fontFamily: 'Inter, sans-serif' } }
      },
      colors: ['#008080'],
      plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
      dataLabels: { enabled: true, style: { fontSize: '10px', fontFamily: 'Inter, sans-serif' } },
      legend: { show: false },
      grid: { borderColor: '#f0f0f0' }
    };
  }

  private emptyDonut() {
    return { series: [1], chart: { type: 'donut', height: 260 }, labels: ['No Data'], colors: ['#e5e7eb'], dataLabels: { enabled: false }, legend: { show: false } };
  }

  private emptyBar() {
    return { series: [{ name: '', data: [0] }], chart: { type: 'bar', height: 250, toolbar: { show: false } }, xaxis: { categories: ['No Data'] }, colors: ['#e5e7eb'], dataLabels: { enabled: false } };
  }

  riskClass(r: string): string {
    return ({ High: 'pill-high', Medium: 'pill-medium', Low: 'pill-low' } as any)[r] ?? '';
  }

  statusClass(s: string): string {
    if (s === 'Rectified') return 'status-green';
    if (s === 'Unrectified') return 'status-red';
    return 'status-amber';
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
    XLSX.utils.book_append_sheet(wb, ws, `Audit_${this.filters.year || 'All'}`);
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `AuditFindings_${this.filters.year || 'All'}.xlsx`);
  }
}
