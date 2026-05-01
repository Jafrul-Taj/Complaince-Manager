import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ComplianceAuditReport, CreateComplianceAuditReportRequest } from '../models/compliance-audit-report.model';

@Injectable({ providedIn: 'root' })
export class ComplianceAuditReportService {
  private readonly API = `${environment.apiUrl}/compliance-audit-reports`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<ComplianceAuditReport[]>(this.API);
  }

  getMyReports() {
    return this.http.get<ComplianceAuditReport[]>(`${this.API}/my-reports`);
  }

  getByBranch(branchId: number) {
    return this.http.get<ComplianceAuditReport[]>(`${this.API}/branch/${branchId}`);
  }

  getById(id: number) {
    return this.http.get<ComplianceAuditReport>(`${this.API}/${id}`);
  }

  create(request: CreateComplianceAuditReportRequest) {
    return this.http.post<ComplianceAuditReport>(this.API, request);
  }

  delete(id: number) {
    return this.http.delete(`${this.API}/${id}`);
  }
}
