import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { UserFormComponent } from '../user-form/user-form.component';
import { UserDetailModalComponent } from '../user-detail-modal/user-detail-modal.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit, AfterViewInit {
  private userSvc = inject(UserService);
  private dialog  = inject(MatDialog);
  private snack   = inject(MatSnackBar);

  columns = ['select', 'fullName', 'username', 'role', 'email', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  allUsers: User[] = [];

  searchTerm   = '';
  roleFilter   = '';
  statusFilter = '';

  selectedIds = new Set<number>();

  @ViewChild(MatSort)      sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit()      { this.load(); }
  ngAfterViewInit() {
    this.dataSource.sort      = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  load() {
    this.userSvc.getAll().subscribe(users => {
      this.allUsers = users;
      this.selectedIds.clear();
      this.applyLocalFilter();
    });
  }

  applyLocalFilter() {
    let filtered = this.allUsers;
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.fullName.toLowerCase().includes(t) ||
        u.username.toLowerCase().includes(t) ||
        u.email.toLowerCase().includes(t) ||
        this.formatRole(u.role).toLowerCase().includes(t)
      );
    }
    if (this.roleFilter)   filtered = filtered.filter(u => u.role === this.roleFilter);
    if (this.statusFilter) filtered = filtered.filter(u =>
      this.statusFilter === 'active' ? u.isActive : !u.isActive
    );
    this.dataSource.data = filtered;
  }

  onSearch(e: Event)       { this.searchTerm   = (e.target as HTMLInputElement).value;  this.applyLocalFilter(); }
  onRoleChange(e: Event)   { this.roleFilter   = (e.target as HTMLSelectElement).value; this.applyLocalFilter(); }
  onStatusChange(e: Event) { this.statusFilter = (e.target as HTMLSelectElement).value; this.applyLocalFilter(); }

  // ── Summary getters ──────────────────────────────────────────────
  get totalCount()    { return this.allUsers.length; }
  get activeCount()   { return this.allUsers.filter(u =>  u.isActive).length; }
  get inactiveCount() { return this.allUsers.filter(u => !u.isActive).length; }
  get operatorCount() { return this.allUsers.filter(u => u.role === 'Operator').length; }
  get officerCount()  { return this.allUsers.filter(u => u.role === 'ComplianceOfficer').length; }
  get headCount()     { return this.allUsers.filter(u => u.role === 'ComplianceHead').length; }

  // ── Bulk select ──────────────────────────────────────────────────
  toggleSelect(id: number) {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
  }

  toggleAll() {
    if (this.isAllSelected()) { this.selectedIds.clear(); }
    else { this.dataSource.data.forEach(u => this.selectedIds.add(u.id)); }
  }

  isAllSelected(): boolean {
    const rows = this.dataSource.data;
    return rows.length > 0 && rows.every(u => this.selectedIds.has(u.id));
  }

  bulkDelete() {
    const count = this.selectedIds.size;
    if (!confirm(`Delete ${count} selected user(s)?`)) return;
    const ids = [...this.selectedIds];
    let done = 0;
    ids.forEach(id => {
      this.userSvc.delete(id).subscribe({
        next:  () => { done++; if (done === ids.length) { this.snack.open(`Deleted ${count} users`, 'OK', { duration: 3000 }); this.load(); } },
        error: () => { done++; if (done === ids.length) { this.snack.open('Some deletions failed', 'OK', { duration: 3000 }); this.load(); } }
      });
    });
  }

  // ── Dialogs ──────────────────────────────────────────────────────
  openDetail(user: User) {
    this.dialog.open(UserDetailModalComponent, {
      width: '460px', maxHeight: '90vh', data: { user }
    });
  }

  openForm(user?: User) {
    const ref = this.dialog.open(UserFormComponent, {
      width: '480px', data: { user }
    });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  delete(user: User) {
    if (!confirm(`Delete user "${user.fullName}"?`)) return;
    this.userSvc.delete(user.id).subscribe({
      next:  () => { this.snack.open('User deleted', 'OK', { duration: 3000 }); this.load(); },
      error: () => this.snack.open('Cannot delete user (may have assignments or findings)', 'OK', { duration: 4000 })
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────
  formatRole(role: string): string {
    const map: Record<string, string> = {
      Operator: 'Operator',
      ComplianceOfficer: 'Compliance Officer',
      ComplianceHead: 'Compliance Head'
    };
    return map[role] ?? role;
  }

  statusDotClass(isActive: boolean): string {
    return isActive ? 'green' : 'gray';
  }
}
