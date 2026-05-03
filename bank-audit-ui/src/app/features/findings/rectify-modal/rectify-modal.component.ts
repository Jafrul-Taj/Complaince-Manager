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
  templateUrl: './rectify-modal.component.html',
  styleUrl: './rectify-modal.component.css'
})
export class RectifyModalComponent {
  finding: AuditFinding;
  saving = false;

  form = this.fb.group({
    complianceStatus: ['Rectified', Validators.required],
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
    if (this.finding.rectificationRemarks) {
      this.form.patchValue({ rectificationRemarks: this.finding.rectificationRemarks });
    }
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    this.findingSvc.rectify(this.finding.id, {
      complianceStatus: v.complianceStatus!,
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
