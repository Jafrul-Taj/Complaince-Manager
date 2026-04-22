import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BranchService } from '../../../core/services/branch.service';
import { Branch } from '../../../core/models/branch.model';
import { BranchFormComponent } from '../branch-form/branch-form.component';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatButtonModule, MatIconModule, MatCardModule,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Branch Management</h1>
        <button mat-raised-button color="primary" (click)="openForm()">
          <mat-icon>add_business</mat-icon> Add Branch
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <mat-form-field appearance="outline" style="width:300px; margin-bottom:16px">
            <mat-label>Search branches</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput (keyup)="applyFilter($event)" placeholder="Name, code..." />
          </mat-form-field>

          <table mat-table [dataSource]="dataSource" matSort class="full-width">
            <ng-container matColumnDef="branchCode">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Code</th>
              <td mat-cell *matCellDef="let b"><strong>{{ b.branchCode }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="branchName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Branch Name</th>
              <td mat-cell *matCellDef="let b">{{ b.branchName }}</td>
            </ng-container>
            <ng-container matColumnDef="isActive">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let b">
                <span [class]="b.isActive ? 'status-active' : 'status-inactive'">
                  {{ b.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let b">
                <button mat-icon-button color="primary" (click)="openForm(b)" title="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="delete(b)" title="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="4" style="text-align:center; padding:24px">No branches found.</td>
            </tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons />
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .status-active   { color: #2e7d32; font-weight: 500; }
    .status-inactive { color: #9e9e9e; }
  `]
})
export class BranchListComponent implements OnInit, AfterViewInit {
  columns = ['branchCode', 'branchName', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<Branch>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private branchSvc: BranchService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  load() {
    this.branchSvc.getAll().subscribe(branches => this.dataSource.data = branches);
  }

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  openForm(branch?: Branch) {
    const ref = this.dialog.open(BranchFormComponent, {
      width: '420px',
      data: { branch }
    });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  delete(branch: Branch) {
    if (!confirm(`Delete branch "${branch.branchName}"?`)) return;
    this.branchSvc.delete(branch.id).subscribe({
      next: () => { this.snack.open('Branch deleted', 'OK', { duration: 3000 }); this.load(); },
      error: () => this.snack.open('Cannot delete branch (has assignments or findings)', 'OK', { duration: 4000 })
    });
  }
}
