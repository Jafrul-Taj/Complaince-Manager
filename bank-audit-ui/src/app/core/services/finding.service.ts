import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuditFinding, CreateFindingRequest, UpdateFindingRequest, RectifyFindingRequest } from '../models/finding.model';

@Injectable({ providedIn: 'root' })
export class FindingService {
  private readonly API = `${environment.apiUrl}/findings`;

  constructor(private http: HttpClient) {}

  getAll(year?: number, branchId?: number) {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    if (branchId) params = params.set('branchId', branchId);
    return this.http.get<AuditFinding[]>(this.API, { params });
  }

  getById(id: number) {
    return this.http.get<AuditFinding>(`${this.API}/${id}`);
  }

  create(request: CreateFindingRequest) {
    return this.http.post<AuditFinding>(this.API, request);
  }

  update(id: number, request: UpdateFindingRequest) {
    return this.http.put<AuditFinding>(`${this.API}/${id}`, request);
  }

  rectify(id: number, request: RectifyFindingRequest) {
    return this.http.patch<AuditFinding>(`${this.API}/${id}/rectify`, request);
  }

  delete(id: number) {
    return this.http.delete(`${this.API}/${id}`);
  }
}
