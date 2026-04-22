import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FindingService } from '../../../core/services/finding.service';
import { AuditFinding } from '../../../core/models/finding.model';

@Component({
  selector: 'app-rectify-modal',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="accent">task_alt</mat-icon>
      Rectify Finding
    </h2>
    <mat-dialog-content>
      <div class="finding-summary">
        <strong>{{ finding.slNo }}</strong> — {{ finding.findingArea }}
        <div class="branch-info">{{ finding.branchName }} | Year {{ finding.year }}</div>
      </div>

      <form [formGroup]="form" style="margin-top:16px">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Rectification Status</mat-label>
          <mat-select formControlName="rectificationStatus">
            <mat-option value="InProgress">In Progress</mat-option>
            <mat-option value="Rectified">Rectified</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Rectification Remarks</mat-label>
          <textarea matInput formControlName="rectificationRemarks" rows="4"
                    placeholder="Describe the actions taken to rectify this finding..."></textarea>
          <mat-hint>Required</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="accent" [disabled]="form.invalid || saving" (click)="save()">
        {{ saving ? 'Saving...' : 'Submit Rectification' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .finding-summary {
      background: #f5f5f5;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 14px;
    }
    .branch-info { color: #666; font-size: 12px; margin-top: 4px; }
    .full-width { width: 100%; margin-bottom: 12px; }
    h2 { display: flex; align-items: center; gap: 8px; }
  `]
})
export class RectifyModalComponent {
  finding: AuditFinding;
  saving = false;

  form = this.fb.group({
    rectificationStatus: ['Rectified', Validators.required],
    rectificationRemarks: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor(
    private fb: FormBuilder,
    private findingSvc: FindingService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<RectifyModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { finding: AuditFinding }
  ) {
    this.finding = data.finding;
    if (this.finding.rectificationStatus === 'InProgress') {
      this.form.patchValue({ rectificationStatus: 'InProgress' });
    }
    if (this.finding.rectificationRemarks) {
      this.form.patchValue({ rectificationRemarks: this.finding.rectificationRemarks });
    }
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    this.findingSvc.rectify(this.finding.id, {
      rectificationStatus: v.rectificationStatus as any,
      rectificationRemarks: v.rectificationRemarks!
    }).subscribe({
      next: () => { this.snack.open('Rectification saved', 'OK', { duration: 3000 }); this.dialogRef.close(true); },
      error: (err) => {
        this.saving = false;
        this.snack.open(err.error?.message || 'Save failed', 'OK', { duration: 4000 });
      }
    });
  }
}
