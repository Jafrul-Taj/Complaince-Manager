import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Shown when the router tries to leave the protected /app area (e.g. via the
 * browser back-button).  Returns true → allow navigation, false → cancel it.
 * The user's session is NEVER cleared here — the guard only controls routing.
 */
@Component({
  selector: 'app-session-leave-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="sld-wrapper">

      <div class="sld-icon-row">
        <div class="sld-icon-bg">
          <mat-icon class="sld-shield">lock</mat-icon>
        </div>
      </div>

      <h2 class="sld-title">Leave protected area?</h2>

      <p class="sld-body">
        You are navigating away from the Compliance Manager.
        <strong>Your session will stay active</strong> — you can return at any
        time without logging in again.
      </p>

      <div class="sld-info-row">
        <mat-icon class="sld-info-icon">verified_user</mat-icon>
        <span>Session and data are preserved.</span>
      </div>

      <div class="sld-actions">
        <button mat-raised-button
                color="primary"
                class="sld-btn-stay"
                (click)="stay()">
          <mat-icon>arrow_back</mat-icon>
          Stay Here
        </button>

        <button mat-stroked-button
                class="sld-btn-leave"
                (click)="leave()">
          Leave Anyway
        </button>
      </div>

    </div>
  `,
  styles: [`
    .sld-wrapper {
      padding: 8px 4px 4px;
      max-width: 380px;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }

    .sld-icon-row {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    .sld-icon-bg {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c62828, #ef5350);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(198,40,40,0.35);
    }

    .sld-shield {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: #fff;
    }

    .sld-title {
      margin: 0 0 10px;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a2e;
      text-align: center;
    }

    .sld-body {
      font-size: 13.5px;
      color: #555;
      line-height: 1.55;
      margin: 0 0 14px;
      text-align: center;
    }

    .sld-info-row {
      display: flex;
      align-items: center;
      gap: 7px;
      background: #e8f5e9;
      border: 1px solid #a5d6a7;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 20px;
      font-size: 12.5px;
      color: #2e7d32;
      font-weight: 500;
    }

    .sld-info-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #388e3c;
      flex-shrink: 0;
    }

    .sld-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .sld-btn-stay {
      font-weight: 700;
      letter-spacing: 0.2px;
    }

    .sld-btn-leave {
      color: #757575;
    }
  `]
})
export class SessionLeaveDialogComponent {
  private dialogRef = inject(MatDialogRef<SessionLeaveDialogComponent>);

  stay()  { this.dialogRef.close(false); }
  leave() { this.dialogRef.close(true);  }
}
