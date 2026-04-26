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
  templateUrl: './branch-list.component.html',
  styleUrl: './branch-list.component.css'
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
