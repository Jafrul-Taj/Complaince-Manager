import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { NgApexchartsModule } from 'ng-apexcharts';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { DashboardService, FilterParams } from '../../core/services/dashboard.service';
import { BranchService } from '../../core/services/branch.service';
import { Branch } from '../../core/models/branch.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule, MatTabsModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private dashSvc   = inject(DashboardService);
  private branchSvc = inject(BranchService);
  private router    = inject(Router);

  // ── Reference data ──────────────────────────────────────────────
  yearOptions        = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  riskOptions        = ['High', 'Medium', 'Low'];
  statusOptions      = ['Rectified', 'Unrectified'];
  lapsesTypeOptions  = ['Operational', 'Documentation'];
  branches: Branch[] = [];
  officers: any[] = [];
  areas: string[] = [];

  // ── Multi-select state (empty array = "All") ─────────────────────
  sel = {
    years:       [] as number[],
    branchIds:   [] as number[],
    areas:       [] as string[],
    risks:       [] as string[],
    statuses:    [] as string[],
    officerIds:  [] as number[],
    lapsesTypes: [] as string[]
  };

  // ── Dropdown open state ──────────────────────────────────────────
  dropOpen: Record<string, boolean> = {
    year: false, branch: false, area: false, risk: false, status: false, officer: false, lapsesType: false
  };

  // ── Search text for searchable dropdowns ─────────────────────────
  dropSearch: Record<string, string> = { branch: '', area: '', officer: '' };

  // ── Table search ─────────────────────────────────────────────────
  branchSearch   = '';
  categorySearch = '';

  // ── Data ─────────────────────────────────────────────────────────
  loading        = false;
  kpis: any      = null;
  riskChart: any = {};
  branchSummary:     any[] = [];
  officerSummary:    any[] = [];
  yearComparison:    any[] = [];
  areaBreakdown:     any[] = [];
  categoryBreakdown: any[] = [];

  // ── Filtered getters ─────────────────────────────────────────────
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

  // ── Dropdown labels ──────────────────────────────────────────────
  get yearLabel(): string {
    if (!this.sel.years.length) return 'All Years';
    return this.joinLabels(this.sel.years.map(String), 3);
  }

  get branchLabel(): string {
    if (!this.sel.branchIds.length) return 'All Branches';
    const names = this.sel.branchIds.map(id =>
      this.branches.find(b => b.id === id)?.branchName ?? String(id));
    return this.joinLabels(names, 2);
  }

  get areaLabel(): string {
    if (!this.sel.areas.length) return 'All Areas';
    return this.joinLabels(this.sel.areas, 2);
  }

  get riskLabel(): string {
    if (!this.sel.risks.length) return 'All Risks';
    return this.joinLabels(this.sel.risks, 3);
  }

  get statusLabel(): string {
    if (!this.sel.statuses.length) return 'All Status';
    return this.joinLabels(this.sel.statuses, 2);
  }

  get officerLabel(): string {
    if (!this.sel.officerIds.length) return 'All Officers';
    const names = this.sel.officerIds.map(id =>
      this.officers.find(o => o.officerId === id)?.officerName ?? String(id));
    return this.joinLabels(names, 2);
  }

  get lapsesTypeLabel(): string {
    if (!this.sel.lapsesTypes.length) return 'All Types';
    return this.joinLabels(this.sel.lapsesTypes, 2);
  }

  private joinLabels(labels: string[], maxShow: number): string {
    if (labels.length <= maxShow) return labels.join(', ');
    return labels.slice(0, maxShow).join(', ') + ` +${labels.length - maxShow} more`;
  }

  // ── All-IDs getters for Select All (arrow fns not allowed in templates) ──
  get allBranchIds():  number[] { return this.branches.map(b => b.id); }
  get allOfficerIds(): number[] { return this.officers.map(o => o.officerId); }

  // ── Filtered dropdown lists ──────────────────────────────────────
  get filteredBranches(): Branch[] {
    const s = this.dropSearch['branch'].toLowerCase();
    return s ? this.branches.filter(b =>
      b.branchName.toLowerCase().includes(s) || b.branchCode?.toLowerCase().includes(s)
    ) : this.branches;
  }

  get filteredAreas(): string[] {
    const s = this.dropSearch['area'].toLowerCase();
    return s ? this.areas.filter(a => a.toLowerCase().includes(s)) : this.areas;
  }

  get filteredOfficers(): any[] {
    const s = this.dropSearch['officer'].toLowerCase();
    return s ? this.officers.filter(o => o.officerName.toLowerCase().includes(s)) : this.officers;
  }

  // ── Close dropdowns on outside click ────────────────────────────
  @HostListener('document:click')
  onDocClick() {
    Object.keys(this.dropOpen).forEach(k => this.dropOpen[k] = false);
  }

  toggleDrop(key: string, e: MouseEvent) {
    e.stopPropagation();
    const wasOpen = this.dropOpen[key];
    Object.keys(this.dropOpen).forEach(k => this.dropOpen[k] = false);
    this.dropOpen[key] = !wasOpen;
  }

  stopProp(e: MouseEvent) { e.stopPropagation(); }

  // ── Toggle helpers ───────────────────────────────────────────────
  toggleItem<T>(arr: T[], item: T) {
    const idx = arr.indexOf(item);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(item);
  }

  isSelected<T>(arr: T[], item: T): boolean { return arr.includes(item); }

  toggleAll<T>(arr: T[], all: T[]) {
    if (arr.length === all.length) { arr.splice(0); }
    else { arr.splice(0); arr.push(...all); }
  }

  isAllSelected<T>(arr: T[], all: T[]): boolean {
    return arr.length === all.length;
  }

  // ── FilterParams getter ──────────────────────────────────────────
  get filterParams(): FilterParams {
    return {
      years:       this.sel.years.length       ? [...this.sel.years]       : undefined,
      branchIds:   this.sel.branchIds.length   ? [...this.sel.branchIds]   : undefined,
      areas:       this.sel.areas.length       ? [...this.sel.areas]       : undefined,
      riskRatings: this.sel.risks.length       ? [...this.sel.risks]       : undefined,
      statuses:    this.sel.statuses.length    ? [...this.sel.statuses]    : undefined,
      officerIds:  this.sel.officerIds.length  ? [...this.sel.officerIds]  : undefined,
      lapsesTypes: this.sel.lapsesTypes.length ? [...this.sel.lapsesTypes] : undefined
    };
  }

  // ── Lifecycle ────────────────────────────────────────────────────
  ngOnInit() {
    this.branchSvc.getAll().subscribe(b => this.branches = b);
    this.dashSvc.getOfficers().subscribe(o => this.officers = o);
    this.dashSvc.getAreaBreakdown({}).subscribe(data => {
      this.areas = data.map((a: any) => a.area).filter(Boolean).sort();
    });
    this.loadAll();
  }

  applyFilters() {
    Object.keys(this.dropOpen).forEach(k => this.dropOpen[k] = false);
    this.loadAll();
  }

  resetFilters() {
    this.sel        = { years: [], branchIds: [], areas: [], risks: [], statuses: [], officerIds: [], lapsesTypes: [] };
    this.branchSearch   = '';
    this.categorySearch = '';
    Object.keys(this.dropSearch).forEach(k => this.dropSearch[k] = '');
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    const fp = this.filterParams;
    console.log('Loading with filters:', fp);
    forkJoin({
      kpis:     this.dashSvc.getKpis(fp),
      risk:     this.dashSvc.getRiskDistribution(fp),
      branch:   this.dashSvc.getBranchSummary(fp),
      year:     this.dashSvc.getYearComparison(fp),
      officer:  this.dashSvc.getOfficerSummary(fp),
      area:     this.dashSvc.getAreaBreakdown(fp),
      category: this.dashSvc.getCategoryBreakdown(fp, 50)
    }).subscribe({
      next: (data) => {
        this.kpis = data.kpis;
        this.buildRiskChart(data.risk ?? []);
        this.branchSummary     = data.branch  ?? [];
        this.officerSummary    = data.officer ?? [];
        this.yearComparison    = data.year    ?? [];
        this.areaBreakdown     = data.area    ?? [];
        this.categoryBreakdown = data.category ?? [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private buildRiskChart(data: any[]) {
    const order  = ['High', 'Medium', 'Low'];
    const sorted = order.map(r => data.find((d: any) => d.riskRating === r)).filter(Boolean);
    if (!sorted.length) {
      this.riskChart = {
        series: [1], chart: { type: 'donut', width: '100%', height: 260 },
        labels: ['No Data'], colors: ['#e5e7eb'],
        dataLabels: { enabled: false }, legend: { show: false }
      };
      return;
    }
    this.riskChart = {
      series:  sorted.map((d: any) => d.count),
      chart:   { type: 'donut', width: '100%', height: 260, toolbar: { show: false } },
      labels:  sorted.map((d: any) => d.riskRating),
      colors:  ['#dc2626', '#d97706', '#16a34a'],
      legend:  { position: 'bottom', fontSize: '12px', fontFamily: 'Inter, sans-serif', markers: { width: 10, height: 10 } },
      plotOptions: { pie: { donut: { size: '68%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '12px', color: '#374151', fontFamily: 'Inter, sans-serif' } } } } },
      dataLabels: { enabled: true, formatter: (val: number) => val.toFixed(1) + '%', style: { fontSize: '12px' } }
    };
  }

  riskClass(r: string): string {
    return ({ High: 'pill-high', Medium: 'pill-medium', Low: 'pill-low' } as any)[r] ?? '';
  }

  // ── Dashboard row click handlers ─────────────────────────────────
  onBranchClick(branchId: number, branchName: string) {
    this.router.navigate(['/app/findings-detail'], {
      queryParams: this.buildNavParams('branch', branchId, null, branchName)
    });
  }

  onOfficerClick(officerId: number, officerName: string) {
    this.router.navigate(['/app/findings-detail'], {
      queryParams: this.buildNavParams('officer', officerId, null, officerName)
    });
  }

  onYearClick(year: number) {
    this.router.navigate(['/app/findings-detail'], {
      queryParams: this.buildNavParams('year', year, null, String(year))
    });
  }

  onAreaClick(area: string) {
    this.router.navigate(['/app/findings-detail'], {
      queryParams: this.buildNavParams('area', null, area, area)
    });
  }

  onCategoryClick(category: string) {
    this.router.navigate(['/app/findings-detail'], {
      queryParams: this.buildNavParams('category', null, category, category)
    });
  }

  private buildNavParams(
    focusType: string,
    focusId: number | null,
    focusValue: string | null,
    focusLabel: string
  ): Record<string, any> {
    const p: Record<string, any> = { focusType, focusLabel };
    if (focusId    !== null) p['focusId']    = focusId;
    if (focusValue !== null) p['focusValue'] = focusValue;

    const fp = this.filterParams;
    if (fp.years?.length)        p['years']       = fp.years.join(',');
    if (fp.branchIds?.length)    p['branchIds']   = fp.branchIds.join(',');
    if (fp.areas?.length)        p['areas']       = fp.areas.join(',');
    if (fp.riskRatings?.length)  p['riskRatings'] = fp.riskRatings.join(',');
    if (fp.statuses?.length)     p['statuses']    = fp.statuses.join(',');
    if (fp.officerIds?.length)   p['officerIds']  = fp.officerIds.join(',');
    if (fp.lapsesTypes?.length)  p['lapsesTypes'] = fp.lapsesTypes.join(',');
    return p;
  }
}
