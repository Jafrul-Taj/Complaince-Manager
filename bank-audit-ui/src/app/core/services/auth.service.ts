import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'bank_audit_token';
  private readonly USER_KEY  = 'bank_audit_user';
  private readonly API       = `${environment.apiUrl}/auth`;

  // ── Reactive state ────────────────────────────────────────────────────────
  private _currentUser = signal<LoginResponse | null>(this.loadUser());

  readonly currentUser = this._currentUser.asReadonly();

  readonly isLoggedIn = computed(
    () => !!this._currentUser() && !this.isTokenExpired()
  );

  readonly role     = computed(() => this._currentUser()?.role     ?? null);
  readonly userId   = computed(() => this._currentUser()?.userId   ?? null);
  readonly fullName = computed(() => this._currentUser()?.fullName ?? '');

  /**
   * Set to `true` immediately before a programmatic logout/redirect so that
   * the preventBackGuard skips its confirmation dialog for that one navigation.
   * The guard resets the flag after consuming it.
   */
  bypassNavigationGuard = false;

  // ── Expiry polling ────────────────────────────────────────────────────────
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.scheduleExpiryCheck();
  }

  // ── Public API ────────────────────────────────────────────────────────────
  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(`${this.API}/login`, { username, password } as LoginRequest)
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response));
          this._currentUser.set(response);
          this.scheduleExpiryCheck();
          this.redirectByRole(response.role);
        })
      );
  }

  /**
   * Programmatic logout — sets `bypassNavigationGuard` so the CanDeactivate
   * dialog is skipped, then clears session data and navigates to /login.
   */
  logout() {
    this.bypassNavigationGuard = true; // tell preventBackGuard to allow this
    this.clearSession();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const user = this._currentUser();
    if (!user?.expiresAt) return false;
    return new Date(user.expiresAt) <= new Date();
  }

  // ── Session persistence helpers ───────────────────────────────────────────
  /**
   * Restores session from localStorage on page refresh.
   * Called in the signal initializer so the app is immediately authenticated
   * on page load without a round-trip to the server.
   */
  private loadUser(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      if (!raw) return null;
      const user: LoginResponse = JSON.parse(raw);
      // Discard expired sessions immediately
      if (user.expiresAt && new Date(user.expiresAt) <= new Date()) {
        this.clearSession();
        return null;
      }
      return user;
    } catch {
      this.clearSession();
      return null;
    }
  }

  private clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.cancelExpiryTimer();
  }

  /**
   * Schedules an auto-logout exactly when the JWT expires so the UI reacts
   * immediately rather than waiting for the next API call to fail.
   */
  private scheduleExpiryCheck() {
    this.cancelExpiryTimer();
    const user = this._currentUser();
    if (!user?.expiresAt) return;

    const msUntilExpiry = new Date(user.expiresAt).getTime() - Date.now();
    if (msUntilExpiry <= 0) {
      this.logout();
      return;
    }

    this.expiryTimer = setTimeout(() => {
      this.logout();
    }, msUntilExpiry);
  }

  private cancelExpiryTimer() {
    if (this.expiryTimer !== null) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }

  // ── Role-based redirect ───────────────────────────────────────────────────
  redirectByRole(role: string) {
    switch (role) {
      case 'Operator':          this.router.navigate(['/app/dashboard']);      break;
      case 'ComplianceOfficer': this.router.navigate(['/app/my-assignments']); break;
      case 'ComplianceHead':    this.router.navigate(['/app/dashboard']);       break;
      default:                  this.router.navigate(['/app/dashboard']);       break;
    }
  }
}
