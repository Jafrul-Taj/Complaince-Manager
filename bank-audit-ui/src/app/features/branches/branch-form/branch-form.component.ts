import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BranchService } from '../../../core/services/branch.service';
import { Branch } from '../../../core/models/branch.model';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSlideToggleModule, MatSnackBarModule
  ],
  templateUrl: './branch-form.component.html',
  styleUrl: './branch-form.component.css'
})
export class BranchFormComponent implements OnInit {
  isEdit: boolean;
  saving = false;

  form = this.fb.group({
    branchCode: [''],
    branchName: ['', Validators.required],
    isActive: [true]
  });

  constructor(
    private fb: FormBuilder,
    private branchSvc: BranchService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<BranchFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { branch?: Branch }
  ) {
    this.isEdit = !!data.branch;
  }

  ngOnInit() {
    if (this.isEdit) {
      this.form.patchValue({ branchName: this.data.branch!.branchName, isActive: this.data.branch!.isActive });
    } else {
      this.form.get('branchCode')!.setValidators(Validators.required);
      this.form.updateValueAndValidity();
    }
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;

    const obs = this.isEdit
      ? this.branchSvc.update(this.data.branch!.id, { branchName: v.branchName!, isActive: v.isActive! })
      : this.branchSvc.create({ branchCode: v.branchCode!, branchName: v.branchName! });

    obs.subscribe({
      next: () => { this.snack.open('Branch saved', 'OK', { duration: 3000 }); this.dialogRef.close(true); },
      error: (err) => {
        this.saving = false;
        this.snack.open(err.error?.message || 'Save failed (code may already exist)', 'OK', { duration: 4000 });
      }
    });
  }
}
