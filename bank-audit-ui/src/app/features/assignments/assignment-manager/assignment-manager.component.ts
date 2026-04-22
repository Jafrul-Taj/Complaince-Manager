import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { AssignmentService } from '../../../core/services/assignment.service';
import { UserService } from '../../../core/services/user.service';
import { BranchService } from '../../../core/services/branch.service';
import { Assignment } from '../../../core/models/assignment.model';
import { User } from '../../../core/models/user.model';
import { Branch } from '../../../core/models/branch.model';

@Component({
  selector: 'app-assignment-manager',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatTableModule, MatSnackBarModule, MatChipsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Branch Assignments</h1>
      </div>

      <div class="assignment-grid">
        <!-- Assignment Form -->
        <mat-card class="assign-form-card">
          <mat-card-title>Assign Branch to Officer</mat-card-title>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="assign()" style="padding-top:16px">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Compliance Officer</mat-label>
                <mat-select formControlName="userId">
                  @for (u of officers; track u.id) {
                    <mat-option [value]="u.id">{{ u.fullName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Branch</mat-label>
                <mat-select formControlName="branchId">
                  @for (b of branches; track b.id) {
                    <mat-option [value]="b.id">{{ b.branchName }} ({{ b.branchCode }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Year</mat-label>
                <mat-select formControlName="year">
                  @for (y of years; track y) {
                    <mat-option [value]="y">{{ y }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit"
                      [disabled]="form.invalid || saving" class="full-width">
                <mat-icon>assignment_turned_in</mat-icon>
                {{ saving ? 'Assigning...' : 'Assign' }}
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Assignments List -->
        <mat-card>
          <mat-card-title>Current Assignments</mat-card-title>
          <mat-card-content>
            <table mat-table [dataSource]="assignments" style="width:100%; margin-top:12px">
              <ng-container matColumnDef="officer">
                <th mat-header-cell *matHeaderCellDef>Officer</th>
                <td mat-cell *matCellDef="let a">{{ a.userFullName }}</td>
              </ng-container>
              <ng-container matColumnDef="branch">
                <th mat-header-cell *matHeaderCellDef>Branch</th>
                <td mat-cell *matCellDef="let a">{{ a.branchName }} <small>({{ a.branchCode }})</small></td>
              </ng-container>
              <ng-container matColumnDef="year">
                <th mat-header-cell *matHeaderCellDef>Year</th>
                <td mat-cell *matCellDef="let a">{{ a.year }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let a">
                  <button mat-icon-button color="warn" (click)="remove(a)" title="Remove">
                    <mat-icon>remove_circle</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns;"></tr>
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="4" style="text-align:center; padding:24px">No assignments yet.</td>
              </tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .assignment-grid {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 24px;
    }
    .assign-form-card mat-card-title { margin-bottom: 0; }
    .full-width { width: 100%; margin-bottom: 12px; }
    @media (max-width: 900px) {
      .assignment-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AssignmentManagerComponent implements OnInit {
  officers: User[] = [];
  branches: Branch[] = [];
  assignments: Assignment[] = [];
  columns = ['officer', 'branch', 'year', 'actions'];
  saving = false;

  years: number[] = [];
  currentYear = new Date().getFullYear();

  form = this.fb.group({
    userId: [null as number | null, Validators.required],
    branchId: [null as number | null, Validators.required],
    year: [this.currentYear, Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private assignSvc: AssignmentService,
    private userSvc: UserService,
    private branchSvc: BranchService,
    private snack: MatSnackBar
  ) {
    this.years = Array.from({ length: 10 }, (_, i) => this.currentYear - 5 + i);
  }

  ngOnInit() {
    this.userSvc.getAll().subscribe(users =>
      this.officers = users.filter(u => u.role === 'ComplianceOfficer' && u.isActive)
    );
    this.branchSvc.getAll().subscribe(b => this.branches = b.filter(x => x.isActive));
    this.loadAssignments();
  }

  loadAssignments() {
    this.assignSvc.getAll().subscribe(a => this.assignments = a);
  }

  assign() {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    this.assignSvc.create({ userId: v.userId!, branchId: v.branchId!, year: v.year! }).subscribe({
      next: () => {
        this.snack.open('Assignment created', 'OK', { duration: 3000 });
        this.saving = false;
        this.loadAssignments();
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(err.error?.message || 'Assignment already exists for this year', 'OK', { duration: 4000 });
      }
    });
  }

  remove(a: Assignment) {
    if (!confirm(`Remove assignment for ${a.userFullName} — ${a.branchName} (${a.year})?`)) return;
    this.assignSvc.delete(a.id).subscribe({
      next: () => { this.snack.open('Assignment removed', 'OK', { duration: 3000 }); this.loadAssignments(); },
      error: () => this.snack.open('Failed to remove assignment', 'OK', { duration: 3000 })
    });
  }
}
