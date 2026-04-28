import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { IccdEmployeeService } from '../../../core/services/iccd-employee.service';
import { User } from '../../../core/models/user.model';
import { IccdEmployee } from '../../../core/models/iccd-employee.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatSlideToggleModule, MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit, OnDestroy {
  isEdit: boolean;
  saving = false;
  employees: IccdEmployee[] = [];
  loadingEmployees = false;

  private subs = new Subscription();

  form = this.fb.group({
    fullName:             ['', Validators.required],
    username:             [''],
    email:                ['', Validators.email],
    role:                 ['ComplianceOfficer'],
    password:             [''],
    isActive:             [true],
    iccdEmployee:         [null as IccdEmployee | null],
    employeeCodeDisplay:  [{ value: '', disabled: true }],
    designationDisplay:   [{ value: '', disabled: true }]
  });

  compareEmployees = (a: IccdEmployee | null, b: IccdEmployee | null): boolean =>
    a?.employeeId === b?.employeeId;

  constructor(
    private fb: FormBuilder,
    private userSvc: UserService,
    private iccdSvc: IccdEmployeeService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User }
  ) {
    this.isEdit = !!data.user;
  }

  get isComplianceOfficer(): boolean {
    return this.form.get('role')?.value === 'ComplianceOfficer';
  }

  ngOnInit() {
    if (this.isEdit) {
      const u = this.data.user!;
      this.form.patchValue({
        fullName: u.fullName,
        email: u.email,
        isActive: u.isActive,
        username: u.username,
        role: u.role
      });
      return;
    }

    // Create mode — set base validators
    this.form.get('username')!.setValidators(Validators.required);
    this.form.get('password')!.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('role')!.setValidators(Validators.required);

    // Apply initial ICCD state based on default role value
    this.applyIccdState(this.form.get('role')!.value ?? '');

    // Update ICCD validation whenever role changes
    this.subs.add(
      this.form.get('role')!.valueChanges.subscribe(role =>
        this.applyIccdState(role ?? '')
      )
    );

    // Auto-fill name/username whenever a new employee is selected
    this.subs.add(
      this.form.get('iccdEmployee')!.valueChanges.subscribe(emp => {
        if (emp) this.fillFromEmployee(emp);
      })
    );

    this.form.updateValueAndValidity();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private applyIccdState(role: string) {
    const ctrl = this.form.get('iccdEmployee')!;
    if (role === 'ComplianceOfficer') {
      ctrl.setValidators(Validators.required);
      this.loadEmployees();
    } else {
      ctrl.clearValidators();
      ctrl.setValue(null, { emitEvent: false });
      this.form.patchValue({ employeeCodeDisplay: '', designationDisplay: '' }, { emitEvent: false });
    }
    ctrl.updateValueAndValidity();
  }

  private loadEmployees() {
    if (this.employees.length || this.loadingEmployees) return;
    this.loadingEmployees = true;
    this.subs.add(
      this.iccdSvc.getComplianceEmployees().subscribe({
        next: data => {
          this.employees = data;
          this.loadingEmployees = false;
        },
        error: () => {
          this.loadingEmployees = false;
          this.snack.open('Failed to load employee list', 'OK', { duration: 3000 });
        }
      })
    );
  }

  private fillFromEmployee(emp: IccdEmployee) {
    this.form.patchValue({
      fullName:            emp.name,
      username:            emp.employeeId,
      employeeCodeDisplay: emp.employeeId,
      designationDisplay:  emp.designation
    }, { emitEvent: false });
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;

    const obs = this.isEdit
      ? this.userSvc.update(this.data.user!.id, {
          fullName: v.fullName!, email: v.email!, isActive: v.isActive!,
          newPassword: v.password || undefined
        })
      : this.userSvc.create({
          username: v.username!, password: v.password!,
          fullName: v.fullName!, role: v.role as any, email: v.email!
        });

    obs.subscribe({
      next: () => {
        this.snack.open('User saved', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: err => {
        this.saving = false;
        this.snack.open(err.error?.message || 'Save failed', 'OK', { duration: 4000 });
      }
    });
  }
}
