import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly API = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getKpis(year: number) {
    return this.http.get<any>(`${this.API}/kpis`, { params: { year } });
  }

  getRiskDistribution(year: number) {
    return this.http.get<any[]>(`${this.API}/risk-distribution`, { params: { year } });
  }

  getStatusBreakdown(year: number) {
    return this.http.get<any[]>(`${this.API}/status-breakdown`, { params: { year } });
  }

  getBranchSummary(year: number) {
    return this.http.get<any[]>(`${this.API}/branch-summary`, { params: { year } });
  }

  getMonthlyTrend(year: number) {
    return this.http.get<any[]>(`${this.API}/trend`, { params: { year } });
  }

  getExportData(year: number, branchId?: number) {
    let params: any = { year };
    if (branchId) params['branchId'] = branchId;
    return this.http.get<any[]>(`${this.API}/export`, { params });
  }
}
