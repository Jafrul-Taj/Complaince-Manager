import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface FilterParams {
  years?:       number[];
  branchIds?:   number[];
  areas?:       string[];
  riskRatings?: string[];
  statuses?:    string[];
  officerIds?:  number[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly API = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  private toParams(f: FilterParams): HttpParams {
    let p = new HttpParams();
    (f.years       ?? []).forEach(v => p = p.append('years',       v));
    (f.branchIds   ?? []).forEach(v => p = p.append('branchIds',   v));
    (f.areas       ?? []).forEach(v => p = p.append('areas',       v));
    (f.riskRatings ?? []).forEach(v => p = p.append('riskRatings', v));
    (f.statuses    ?? []).forEach(v => p = p.append('statuses',    v));
    (f.officerIds  ?? []).forEach(v => p = p.append('officerIds',  v));
    return p;
  }

  getKpis(f: FilterParams) {
    return this.http.get<any>(`${this.API}/kpis`, { params: this.toParams(f) });
  }

  getRiskDistribution(f: FilterParams) {
    return this.http.get<any[]>(`${this.API}/risk-distribution`, { params: this.toParams(f) });
  }

  getBranchSummary(f: FilterParams) {
    return this.http.get<any[]>(`${this.API}/branch-summary`, { params: this.toParams(f) });
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
    (f.branchIds ?? []).forEach(v => p = p.append('branchIds', v));
    (f.areas     ?? []).forEach(v => p = p.append('areas',     v));
    return this.http.get<any[]>(`${this.API}/year-comparison`, { params: p });
  }

  getOfficers() {
    return this.http.get<any[]>(`${this.API}/officers`);
  }

  getExportData(f: FilterParams) {
    return this.http.get<any[]>(`${this.API}/export`, { params: this.toParams(f) });
  }
}
