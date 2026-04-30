import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'bank_audit_token';
  private readonly USER_KEY = 'bank_audit_user';
  private readonly API = `${environment.apiUrl}/auth`;

  private _currentUser = signal<LoginResponse | null>(this.loadUser());

  currentUser = this._currentUser.asReadonly();
  isLoggedIn = computed(() => !!this._currentUser());
  role = computed(() => this._currentUser()?.role ?? null);
  userId = computed(() => this._currentUser()?.userId ?? null);
  fullName = computed(() => this._currentUser()?.fullName ?? '');

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${this.API}/login`, { username, password } as LoginRequest)
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response));
          this._currentUser.set(response);
          this.redirectByRole(response.role);
        })
      );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUser(): LoginResponse | null {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  private redirectByRole(role: string) {
    switch (role) {
      case 'Operator':          this.router.navigate(['/app/users']); break;
      case 'ComplianceOfficer': this.router.navigate(['/app/my-assignments']); break;
      case 'ComplianceHead':    this.router.navigate(['/app/dashboard']); break;
      default:                  this.router.navigate(['/app/dashboard']); break;
    }
  }
}
