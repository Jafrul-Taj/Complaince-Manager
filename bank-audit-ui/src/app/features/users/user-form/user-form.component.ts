import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatSlideToggleModule, MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit User' : 'Add User' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="fullName" />
        </mat-form-field>

        @if (!isEdit) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username" />
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" />
        </mat-form-field>

        @if (!isEdit) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role">
              <mat-option value="ComplianceOfficer">Compliance Officer</mat-option>
              <mat-option value="ComplianceHead">Compliance Head</mat-option>
              <mat-option value="Operator">Operator</mat-option>
            </mat-select>
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ isEdit ? 'New Password (leave blank to keep)' : 'Password' }}</mat-label>
          <input matInput formControlName="password" type="password" />
        </mat-form-field>

        @if (isEdit) {
          <div style="margin: 8px 0">
            <mat-slide-toggle formControlName="isActive">Active</mat-slide-toggle>
          </div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || saving" (click)="save()">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; margin-bottom: 8px; } .form-grid { min-width: 380px; }`]
})
export class UserFormComponent implements OnInit {
  isEdit: boolean;
  saving = false;

  form = this.fb.group({
    fullName: ['', Validators.required],
    username: [''],
    email: ['', Validators.email],
    role: ['ComplianceOfficer'],
    password: [''],
    isActive: [true]
  });

  constructor(
    private fb: FormBuilder,
    private userSvc: UserService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User }
  ) {
    this.isEdit = !!data.user;
  }

  ngOnInit() {
    if (this.isEdit) {
      const u = this.data.user!;
      this.form.patchValue({ fullName: u.fullName, email: u.email, isActive: u.isActive });
    } else {
      this.form.get('username')!.setValidators(Validators.required);
      this.form.get('password')!.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('role')!.setValidators(Validators.required);
      this.form.updateValueAndValidity();
    }
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;

    const obs = this.isEdit
      ? this.userSvc.update(this.data.user!.id, { fullName: v.fullName!, email: v.email!, isActive: v.isActive!, newPassword: v.password || undefined })
      : this.userSvc.create({ username: v.username!, password: v.password!, fullName: v.fullName!, role: v.role as any, email: v.email! });

    obs.subscribe({
      next: () => { this.snack.open('User saved', 'OK', { duration: 3000 }); this.dialogRef.close(true); },
      error: (err) => {
        this.saving = false;
        this.snack.open(err.error?.message || 'Save failed', 'OK', { duration: 4000 });
      }
    });
  }
}
