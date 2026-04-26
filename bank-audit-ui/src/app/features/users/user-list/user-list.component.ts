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
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
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
