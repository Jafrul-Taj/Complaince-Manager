import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Branch, CreateBranchRequest, UpdateBranchRequest } from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private readonly API = `${environment.apiUrl}/branches`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Branch[]>(this.API);
  }

  getById(id: number) {
    return this.http.get<Branch>(`${this.API}/${id}`);
  }

  create(request: CreateBranchRequest) {
    return this.http.post<Branch>(this.API, request);
  }

  update(id: number, request: UpdateBranchRequest) {
    return this.http.put<Branch>(`${this.API}/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete(`${this.API}/${id}`);
  }
}
