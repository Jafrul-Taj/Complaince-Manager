import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { FindingService } from '../../../core/services/finding.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { AuthService } from '../../../core/services/auth.service';
import { AuditFinding } from '../../../core/models/finding.model';
import { Assignment } from '../../../core/models/assignment.model';
import { FindingFormComponent } from '../finding-form/finding-form.component';
import { RectifyModalComponent } from '../rectify-modal/rectify-modal.component';

@Component({
  selector: 'app-findings-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatButtonModule, MatIconModule, MatCardModule,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Audit Findings</h1>
        <button mat-raised-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Add Finding
        </button>
      </div>

      <!-- Filters -->
      <mat-card style="margin-bottom:16px">
        <mat-card-content style="padding:16px">
          <div class="filters-row">
            <mat-form-field appearance="outline">
              <mat-label>Year</mat-label>
              <mat-select [(value)]="selectedYear" (selectionChange)="load()">
                <mat-option [value]="null">All Years</mat-option>
                @for (y of years; track y) {
                  <mat-option [value]="y">{{ y }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Branch</mat-label>
              <mat-select [(value)]="selectedBranchId" (selectionChange)="load()">
                <mat-option [value]="null">All Branches</mat-option>
                @for (a of myAssignments; track a.branchId) {
                  <mat-option [value]="a.branchId">{{ a.branchName }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Risk Rating</mat-label>
              <mat-select [(value)]="riskFilter" (selectionChange)="applyLocalFilter()">
                <mat-option value="">All</mat-option>
                <mat-option value="Critical">Critical</mat-option>
                <mat-option value="High">High</mat-option>
                <mat-option value="Medium">Medium</mat-option>
                <mat-option value="Low">Low</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(value)]="statusFilter" (selectionChange)="applyLocalFilter()">
                <mat-option value="">All</mat-option>
                <mat-option value="Pending">Pending</mat-option>
                <mat-option value="InProgress">In Progress</mat-option>
                <mat-option value="Rectified">Rectified</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Table -->
      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="dataSource" matSort class="full-width">
            <ng-container matColumnDef="slNo">
              <th mat-header-cell *matHeaderCellDef>Sl.No</th>
              <td mat-cell *matCellDef="let f">{{ f.slNo }}</td>
            </ng-container>
            <ng-container matColumnDef="branchName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Branch</th>
              <td mat-cell *matCellDef="let f">{{ f.branchName }}</td>
            </ng-container>
            <ng-container matColumnDef="findingArea">
              <th mat-header-cell *matHeaderCellDef>Finding Area</th>
              <td mat-cell *matCellDef="let f">{{ f.findingArea }}</td>
            </ng-container>
            <ng-container matColumnDef="findingDetails">
              <th mat-header-cell *matHeaderCellDef>Details</th>
              <td mat-cell *matCellDef="let f" class="details-cell">{{ f.findingDetails | slice:0:80 }}{{ f.findingDetails.length > 80 ? '...' : '' }}</td>
            </ng-container>
            <ng-container matColumnDef="riskRating">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Risk</th>
              <td mat-cell *matCellDef="let f">
                <span [class]="'chip-' + f.riskRating.toLowerCase()" class="status-chip">{{ f.riskRating }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="rectificationStatus">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let f">
                <span [class]="statusClass(f.rectificationStatus)" class="status-chip">{{ formatStatus(f.rectificationStatus) }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="year">
              <th mat-header-cell *matHeaderCellDef>Year</th>
              <td mat-cell *matCellDef="let f">{{ f.year }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let f">
                <button mat-icon-button color="primary" (click)="openForm(f)" title="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                @if (f.rectificationStatus !== 'Rectified') {
                  <button mat-icon-button color="accent" (click)="openRectify(f)" title="Rectify">
                    <mat-icon>task_alt</mat-icon>
                  </button>
                }
                <button mat-icon-button color="warn" (click)="delete(f)" title="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="8" style="text-align:center; padding:24px">No findings found.</td>
            </tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons />
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .filters-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .filters-row mat-form-field { min-width: 160px; }
    .status-chip {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .details-cell { max-width: 260px; }
  `]
})
export class FindingsListComponent implements OnInit, AfterViewInit {
  columns = ['slNo', 'branchName', 'findingArea', 'findingDetails', 'riskRating', 'rectificationStatus', 'year', 'actions'];
  dataSource = new MatTableDataSource<AuditFinding>([]);
  allFindings: AuditFinding[] = [];
  myAssignments: Assignment[] = [];

  selectedYear: number | null = new Date().getFullYear();
  selectedBranchId: number | null = null;
  riskFilter = '';
  statusFilter = '';

  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private findingSvc: FindingService,
    private assignSvc: AssignmentService,
    private auth: AuthService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    const uid = this.auth.userId();
    if (uid) {
      this.assignSvc.getByUser(uid).subscribe(a => this.myAssignments = a);
    }
    this.load();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  load() {
    this.findingSvc.getAll(
      this.selectedYear ?? undefined,
      this.selectedBranchId ?? undefined
    ).subscribe(findings => {
      this.allFindings = findings;
      this.applyLocalFilter();
    });
  }

  applyLocalFilter() {
    let filtered = this.allFindings;
    if (this.riskFilter) filtered = filtered.filter(f => f.riskRating === this.riskFilter);
    if (this.statusFilter) filtered = filtered.filter(f => f.rectificationStatus === this.statusFilter);
    this.dataSource.data = filtered;
  }

  openForm(finding?: AuditFinding) {
    const ref = this.dialog.open(FindingFormComponent, {
      width: '620px',
      data: { finding, assignments: this.myAssignments }
    });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  openRectify(finding: AuditFinding) {
    const ref = this.dialog.open(RectifyModalComponent, {
      width: '480px',
      data: { finding }
    });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  delete(f: AuditFinding) {
    if (!confirm(`Delete finding "${f.slNo} — ${f.findingArea}"?`)) return;
    this.findingSvc.delete(f.id).subscribe({
      next: () => { this.snack.open('Finding deleted', 'OK', { duration: 3000 }); this.load(); },
      error: () => this.snack.open('Delete failed', 'OK', { duration: 3000 })
    });
  }

  statusClass(s: string) {
    switch (s) {
      case 'Pending':    return 'chip-pending';
      case 'InProgress': return 'chip-inprogress';
      case 'Rectified':  return 'chip-rectified';
      default: return '';
    }
  }

  formatStatus(s: string) {
    return s === 'InProgress' ? 'In Progress' : s;
  }
}
