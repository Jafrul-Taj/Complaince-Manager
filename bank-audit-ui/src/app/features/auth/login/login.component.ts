import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-bg">
      <mat-card class="login-card">
        <div class="login-logo">
          <mat-icon class="bank-icon">account_balance</mat-icon>
          <h1>Bank Audit</h1>
          <p>Compliance Management Portal</p>
        </div>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <input matInput formControlName="username" autocomplete="username" />
              @if (form.get('username')?.hasError('required') && form.get('username')?.touched) {
                <mat-error>Username is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput
                     [type]="hidePass ? 'password' : 'text'"
                     formControlName="password"
                     autocomplete="current-password" />
              <button mat-icon-button matSuffix type="button" (click)="hidePass = !hidePass">
                <mat-icon>{{ hidePass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            @if (errorMsg) {
              <div class="error-banner">
                <mat-icon>error_outline</mat-icon>
                {{ errorMsg }}
              </div>
            }

            <button mat-raised-button color="primary" type="submit"
                    class="full-width login-btn" [disabled]="form.invalid || loading">
              @if (loading) {
                <mat-spinner diameter="20" />
              } @else {
                Sign In
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-bg {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%);
    }
    .login-card {
      width: 400px;
      padding: 32px;
      border-radius: 12px !important;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3) !important;
    }
    .login-logo {
      text-align: center;
      margin-bottom: 32px;
    }
    .bank-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: #1a237e;
      display: block;
      margin: 0 auto 12px;
    }
    .login-logo h1 {
      font-size: 24px;
      font-weight: 600;
      color: #1a237e;
      margin-bottom: 4px;
    }
    .login-logo p {
      font-size: 13px;
      color: #666;
    }
    .full-width { width: 100%; margin-bottom: 16px; }
    .login-btn { height: 48px; font-size: 16px; margin-top: 8px; }
    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #ffebee;
      color: #c62828;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 14px;
    }
  `]
})
export class LoginComponent {
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  hidePass = true;
  loading = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';

    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: () => { this.loading = false; },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Invalid username or password. Please try again.';
      }
    });
  }
}
