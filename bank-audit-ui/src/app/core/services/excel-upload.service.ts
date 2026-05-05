import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface UploadSummary {
  fileName: string;
  uploadedAt: string;
  recordCount: number;
  reconciledCount: number;
}

export interface UploadResult {
  imported: number;
  fileName: string;
}

export interface ReconcileResult {
  assignmentsCreated: number;
  reportsCreated: number;
  findingsCreated: number;
  rowsReconciled: number;
  errors: string[];
}

@Injectable({ providedIn: 'root' })
export class ExcelUploadService {
  private readonly API = `${environment.apiUrl}/excel-upload`;

  constructor(private http: HttpClient) {}

  upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UploadResult>(this.API, form);
  }

  getSummary() {
    return this.http.get<UploadSummary[]>(this.API);
  }

  reconcile() {
    return this.http.post<ReconcileResult>(`${this.API}/reconcile`, {});
  }
}
