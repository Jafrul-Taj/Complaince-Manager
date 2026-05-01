import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FindingService } from '../../../core/services/finding.service';
import { AuditFinding } from '../../../core/models/finding.model';

@Component({
  selector: 'app-finding-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './finding-form.component.html',
  styleUrl: './finding-form.component.css'
})
export class FindingFormComponent implements OnInit {
  isEdit: boolean;
  saving = false;

  form = this.fb.group({
    slNo: ['', Validators.required],
    findingArea: ['', Validators.required],
    findingDetails: ['', Validators.required],
    riskRating: ['Medium', Validators.required],
    noOfInstances: ['']
  });

  constructor(
    private fb: FormBuilder,
    private findingSvc: FindingService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<FindingFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { finding?: AuditFinding; reportId?: number }
  ) {
    this.isEdit = !!data.finding;
  }

  ngOnInit() {
    if (this.isEdit) {
      const f = this.data.finding!;
      this.form.patchValue({
        slNo: f.slNo,
        findingArea: f.findingArea,
        findingDetails: f.findingDetails,
        riskRating: f.riskRating,
        noOfInstances: f.noOfInstances
      });
    }
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;

    const obs = this.isEdit
      ? this.findingSvc.update(this.data.finding!.id, {
          slNo: v.slNo!,
          findingArea: v.findingArea!,
          findingDetails: v.findingDetails!,
          riskRating: v.riskRating as any,
          noOfInstances: v.noOfInstances || ''
        })
      : this.findingSvc.create({
          complianceAuditReportId: this.data.reportId!,
          slNo: v.slNo!,
          findingArea: v.findingArea!,
          findingDetails: v.findingDetails!,
          riskRating: v.riskRating as any,
          noOfInstances: v.noOfInstances || ''
        });

    obs.subscribe({
      next: () => { this.snack.open('Finding saved', 'OK', { duration: 3000 }); this.dialogRef.close(true); },
      error: (err) => {
        this.saving = false;
        this.snack.open(err.error?.message || 'Save failed', 'OK', { duration: 4000 });
      }
    });
  }
}
