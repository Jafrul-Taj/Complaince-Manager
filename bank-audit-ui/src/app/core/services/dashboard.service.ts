import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface FilterParams {
  year?: number | null;
  branchId?: number | null;
  area?: string | null;
  riskRating?: string | null;
  complianceStatus?: string | null;
  officerId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly API = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  private toParams(f: FilterParams): HttpParams {
    let p = new HttpParams();
    if (f.year) p = p.set('year', f.year);
    if (f.branchId) p = p.set('branchId', f.branchId);
    if (f.area) p = p.set('area', f.area);
    if (f.riskRating) p = p.set('riskRating', f.riskRating);
    if (f.complianceStatus) p = p.set('complianceStatus', f.complianceStatus);
    if (f.officerId) p = p.set('officerId', f.officerId);
    return p;
  }

  getKpis(f: FilterParams) {
    return this.http.get<any>(`${this.API}/kpis`, { params: this.toParams(f) });
  }

  getRiskDistribution(f: FilterParams) {
    return this.http.get<any[]>(`${this.API}/risk-distribution`, { params: this.toParams(f) });
  }

  getStatusBreakdown(f: FilterParams) {
    return this.http.get<any[]>(`${this.API}/status-breakdown`, { params: this.toParams(f) });
  }

  getBranchSummary(f: FilterParams) {
    return this.http.get<any[]>(`${this.API}/branch-summary`, { params: this.toParams(f) });
  }

  getMonthlyTrend(f: FilterParams) {
    return this.http.get<any[]>(`${this.API}/trend`, { params: this.toParams(f) });
  }

  getAreaBreakdown(f: FilterParams) {
    return this.http.get<any[]>(`${this.API}/area-breakdown`, { params: this.toParams(f) });
  }

  getCategoryBreakdown(f: FilterParams, top = 50) {
    return this.http.get<any[]>(`${this.API}/category-breakdown`, {
      params: this.toParams(f).set('top', top)
    });
  }

  getOfficerSummary(f: FilterParams) {
    return this.http.get<any[]>(`${this.API}/officer-summary`, { params: this.toParams(f) });
  }

  getYearComparison(f: FilterParams) {
    let p = new HttpParams();
    if (f.branchId) p = p.set('branchId', f.branchId);
    if (f.area) p = p.set('area', f.area);
    return this.http.get<any[]>(`${this.API}/year-comparison`, { params: p });
  }

  getRecentFindings(f: FilterParams, count = 8) {
    return this.http.get<any[]>(`${this.API}/recent-findings`, {
      params: this.toParams(f).set('count', count)
    });
  }

  getOfficers() {
    return this.http.get<any[]>(`${this.API}/officers`);
  }

  getExportData(f: FilterParams) {
    return this.http.get<any[]>(`${this.API}/export`, { params: this.toParams(f) });
  }
}
