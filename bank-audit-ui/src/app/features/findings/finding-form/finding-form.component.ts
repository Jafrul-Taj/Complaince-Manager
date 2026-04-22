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
import { Assignment } from '../../../core/models/assignment.model';

@Component({
  selector: 'app-finding-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Finding' : 'Add Finding' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="finding-form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Branch</mat-label>
            <mat-select formControlName="branchId">
              @for (a of assignments; track a.branchId) {
                <mat-option [value]="a.branchId">{{ a.branchName }} ({{ a.branchCode }})</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Year</mat-label>
            <mat-select formControlName="year">
              @for (y of years; track y) {
                <mat-option [value]="y">{{ y }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Sl. No</mat-label>
            <input matInput formControlName="slNo" placeholder="e.g. i., ii., v." />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Finding Area</mat-label>
            <input matInput formControlName="findingArea" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Finding Details</mat-label>
          <textarea matInput formControlName="findingDetails" rows="4"></textarea>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Risk Rating</mat-label>
            <mat-select formControlName="riskRating">
              <mat-option value="Low">Low</mat-option>
              <mat-option value="Medium">Medium</mat-option>
              <mat-option value="High">High</mat-option>
              <mat-option value="Critical">Critical</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>No. of Instances</mat-label>
            <input matInput formControlName="noOfInstances" placeholder="e.g. 3, NI ACT Case was filed" />
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || saving" (click)="save()">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .finding-form { min-width: 560px; padding-top: 8px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
    mat-form-field { margin-bottom: 8px; }
  `]
})
export class FindingFormComponent implements OnInit {
  isEdit: boolean;
  saving = false;
  assignments: Assignment[] = [];
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  form = this.fb.group({
    branchId: [null as number | null, Validators.required],
    year: [new Date().getFullYear(), Validators.required],
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
    @Inject(MAT_DIALOG_DATA) public data: { finding?: AuditFinding; assignments: Assignment[] }
  ) {
    this.isEdit = !!data.finding;
    this.assignments = data.assignments;
  }

  ngOnInit() {
    if (this.isEdit) {
      const f = this.data.finding!;
      this.form.patchValue({
        branchId: f.branchId,
        year: f.year,
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
    const payload: any = {
      branchId: v.branchId!,
      year: v.year!,
      slNo: v.slNo!,
      findingArea: v.findingArea!,
      findingDetails: v.findingDetails!,
      riskRating: v.riskRating!,
      noOfInstances: v.noOfInstances || ''
    };

    const obs = this.isEdit
      ? this.findingSvc.update(this.data.finding!.id, payload)
      : this.findingSvc.create(payload);

    obs.subscribe({
      next: () => { this.snack.open('Finding saved', 'OK', { duration: 3000 }); this.dialogRef.close(true); },
      error: (err) => {
        this.saving = false;
        this.snack.open(err.error?.message || 'Save failed', 'OK', { duration: 4000 });
      }
    });
  }
}
