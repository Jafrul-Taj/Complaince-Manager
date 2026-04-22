import { Component, OnInit, ViewChild } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatButtonModule, MatIconModule, MatCardModule,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatSnackBarModule, MatSlideToggleModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>User Management</h1>
        <button mat-raised-button color="primary" (click)="openForm()">
          <mat-icon>person_add</mat-icon> Add User
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <mat-form-field appearance="outline" style="width:300px; margin-bottom:16px">
            <mat-label>Search users</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput (keyup)="applyFilter($event)" placeholder="Name, username, role..." />
          </mat-form-field>

          <table mat-table [dataSource]="dataSource" matSort class="full-width">
            <ng-container matColumnDef="fullName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Full Name</th>
              <td mat-cell *matCellDef="let u">{{ u.fullName }}</td>
            </ng-container>
            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Username</th>
              <td mat-cell *matCellDef="let u">{{ u.username }}</td>
            </ng-container>
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
              <td mat-cell *matCellDef="let u">
                <span class="role-badge role-{{ u.role.toLowerCase() }}">{{ formatRole(u.role) }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let u">{{ u.email }}</td>
            </ng-container>
            <ng-container matColumnDef="isActive">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let u">
                <span [class]="u.isActive ? 'status-active' : 'status-inactive'">
                  {{ u.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let u">
                <button mat-icon-button color="primary" (click)="openForm(u)" title="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="delete(u)" title="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="6" style="text-align:center; padding:24px">No users found.</td>
            </tr>
          </table>

          <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons />
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .role-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .role-operator          { background: #e3f2fd; color: #1565c0; }
    .role-complianceofficer { background: #f3e5f5; color: #6a1b9a; }
    .role-compliancehead    { background: #e8f5e9; color: #2e7d32; }
    .status-active   { color: #2e7d32; font-weight: 500; }
    .status-inactive { color: #9e9e9e; }
  `]
})
export class UserListComponent implements OnInit {
  columns = ['fullName', 'username', 'role', 'email', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<User>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userSvc: UserService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  load() {
    this.userSvc.getAll().subscribe(users => this.dataSource.data = users);
  }

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  openForm(user?: User) {
    const ref = this.dialog.open(UserFormComponent, {
      width: '480px',
      data: { user }
    });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  delete(user: User) {
    if (!confirm(`Delete user "${user.fullName}"?`)) return;
    this.userSvc.delete(user.id).subscribe({
      next: () => { this.snack.open('User deleted', 'OK', { duration: 3000 }); this.load(); },
      error: () => this.snack.open('Cannot delete user (may have assignments or findings)', 'OK', { duration: 4000 })
    });
  }

  formatRole(role: string) {
    switch (role) {
      case 'Operator':          return 'Operator';
      case 'ComplianceOfficer': return 'Compliance Officer';
      case 'ComplianceHead':    return 'Compliance Head';
      default: return role;
    }
  }
}
