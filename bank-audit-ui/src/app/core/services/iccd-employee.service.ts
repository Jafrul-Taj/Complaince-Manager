import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IccdEmployee } from '../models/iccd-employee.model';

@Injectable({ providedIn: 'root' })
export class IccdEmployeeService {
  private readonly API = `${environment.apiUrl}/iccdemployee`;
  private complianceCache: IccdEmployee[] | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<IccdEmployee[]> {
    return this.http.get<IccdEmployee[]>(this.API).pipe(catchError(() => of([])));
  }

  getComplianceEmployees(): Observable<IccdEmployee[]> {
    if (this.complianceCache) return of(this.complianceCache);
    return this.http.get<IccdEmployee[]>(`${this.API}?unit=Compliance`).pipe(
      tap(data => (this.complianceCache = data)),
      catchError(() => of([]))
    );
  }
}
