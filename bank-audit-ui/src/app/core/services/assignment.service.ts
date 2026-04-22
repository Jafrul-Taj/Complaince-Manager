import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Assignment, AssignBranchRequest } from '../models/assignment.model';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private readonly API = `${environment.apiUrl}/assignments`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Assignment[]>(this.API);
  }

  getByUser(userId: number) {
    return this.http.get<Assignment[]>(`${this.API}/user/${userId}`);
  }

  create(request: AssignBranchRequest) {
    return this.http.post<Assignment>(this.API, request);
  }

  delete(id: number) {
    return this.http.delete(`${this.API}/${id}`);
  }
}
