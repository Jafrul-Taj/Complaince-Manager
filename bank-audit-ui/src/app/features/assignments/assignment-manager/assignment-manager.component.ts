import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AssignmentService } from '../../../core/services/assignment.service';
import { UserService } from '../../../core/services/user.service';
import { BranchService } from '../../../core/services/branch.service';
import { ComplianceAuditReportService } from '../../../core/services/compliance-audit-report.service';
import { Assignment } from '../../../core/models/assignment.model';
import { ComplianceAuditReport } from '../../../core/models/compliance-audit-report.model';
import { User } from '../../../core/models/user.model';
import { Branch } from '../../../core/models/branch.model';

@Component({
  selector: 'app-assignment-manager',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatAutocompleteModule, MatButtonModule, MatIconModule,
    MatTableModule, MatSortModule, MatSnackBarModule, MatChipsModule, MatDividerModule
  ],
  templateUrl: './assignment-manager.component.html',
  styleUrl: './assignment-manager.component.css'
})
export class AssignmentManagerComponent implements OnInit, AfterViewInit {
  // ── Assignments ──────────────────────────────────────────────
  officers: User[] = [];
  branches: Branch[] = [];
  assignments: Assignment[] = [];
  dataSource = new MatTableDataSource<Assignment>();
  @ViewChild('assignSort') assignSort!: MatSort;
  assignColumns = ['officer', 'branch', 'actions'];
  saving = false;
  editingId: number | null = null;
  searchTerm = '';

  officerSearchControl = new FormControl<string | User | null>('');
  branchSearchControl = new FormControl<string | Branch | null>('');
  filteredOfficers$: Observable<User[]> = new Observable<User[]>();
  filteredBranches$: Observable<Branch[]> = new Observable<Branch[]>();

  form = this.fb.group({
    userId: [null as number | null, Validators.required],
    branchId: [null as number | null, Validators.required]
  });

  // ── Audit Reports ─────────────────────────────────────────────
  reports: ComplianceAuditReport[] = [];
  reportsDataSource = new MatTableDataSource<ComplianceAuditReport>();
  @ViewChild('reportsSort') reportsSort!: MatSort;
  reportColumns = ['officer', 'branch', 'year', 'teamLead', 'findings', 'status'];
  reportSearch = '';

  constructor(
    private fb: FormBuilder,
    private assignSvc: AssignmentService,
    private userSvc: UserService,
    private branchSvc: BranchService,
    private reportSvc: ComplianceAuditReportService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.filteredOfficers$ = this.officerSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterOfficers(value))
    );
    this.filteredBranches$ = this.branchSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterBranches(value))
    );
    this.officerSearchControl.valueChanges.subscribe(value => {
      if (typeof value === 'string') this.form.get('userId')?.setValue(null);
    });
    this.branchSearchControl.valueChanges.subscribe(value => {
      if (typeof value === 'string') this.form.get('branchId')?.setValue(null);
    });

    this.userSvc.getAll().subscribe(users =>
      this.officers = users.filter(u => u.role === 'ComplianceOfficer' && u.isActive)
    );
    this.branchSvc.getAll().subscribe(b => this.branches = b.filter(x => x.isActive));
    this.loadAssignments();
    this.loadReports();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.assignSort;
    this.reportsDataSource.sort = this.reportsSort;
  }

  // ── Assignments ───────────────────────────────────────────────
  loadAssignments() {
    this.assignSvc.getAll().subscribe(a => {
      this.assignments = a;
      this.dataSource.data = a;
    });
  }

  onAssignSearch(event: Event) {
    const filter = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchTerm = filter;
    this.dataSource.filter = filter;
    this.dataSource.filterPredicate = (data: Assignment, f: string) =>
      data.userFullName.toLowerCase().includes(f) ||
      data.branchName.toLowerCase().includes(f) ||
      data.branchCode.toLowerCase().includes(f);
  }

  get isEditMode(): boolean { return this.editingId !== null; }

  editAssignment(a: Assignment) {
    this.editingId = a.id;
    this.form.patchValue({ userId: a.userId, branchId: a.branchId });
    this.officerSearchControl.setValue(this.officers.find(u => u.id === a.userId) ?? null, { emitEvent: false });
    this.branchSearchControl.setValue(this.branches.find(b => b.id === a.branchId) ?? null, { emitEvent: false });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ userId: null, branchId: null });
    this.officerSearchControl.setValue('');
    this.branchSearchControl.setValue('');
  }

  save() {
    if (this.form.invalid) return;
    this.isEditMode ? this.update() : this.assign();
  }

  update() {
    if (this.editingId === null || this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    this.assignSvc.update(this.editingId, { userId: v.userId!, branchId: v.branchId! }).subscribe({
      next: () => {
        this.snack.open('Assignment updated', 'OK', { duration: 3000 });
        this.saving = false;
        this.cancelEdit();
        this.loadAssignments();
      },
      error: () => { this.saving = false; this.snack.open('Failed to update', 'OK', { duration: 3000 }); }
    });
  }

  assign() {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    this.assignSvc.create({ userId: v.userId!, branchId: v.branchId! }).subscribe({
      next: () => {
        this.snack.open('Assignment created', 'OK', { duration: 3000 });
        this.saving = false;
        this.cancelEdit();
        this.loadAssignments();
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(err.error?.message || 'Officer already assigned to this branch', 'OK', { duration: 4000 });
      }
    });
  }

  remove(a: Assignment) {
    if (!confirm(`Remove assignment for ${a.userFullName} — ${a.branchName}?`)) return;
    this.assignSvc.delete(a.id).subscribe({
      next: () => { this.snack.open('Assignment removed', 'OK', { duration: 3000 }); this.loadAssignments(); },
      error: () => this.snack.open('Failed to remove', 'OK', { duration: 3000 })
    });
  }

  private filterOfficers(value: string | User | null): User[] {
    const f = (typeof value === 'string' ? value : value?.fullName ?? '').toLowerCase().trim();
    return f ? this.officers.filter(u => u.fullName.toLowerCase().includes(f)) : this.officers;
  }

  private filterBranches(value: string | Branch | null): Branch[] {
    const f = (typeof value === 'string' ? value : value?.branchName ?? '').toLowerCase().trim();
    return f
      ? this.branches.filter(b => b.branchName.toLowerCase().includes(f) || b.branchCode.toLowerCase().includes(f))
      : this.branches;
  }

  selectOfficer(user: User) {
    this.form.get('userId')?.setValue(user.id);
    this.officerSearchControl.setValue(user, { emitEvent: false });
  }

  selectBranch(branch: Branch) {
    this.form.get('branchId')?.setValue(branch.id);
    this.branchSearchControl.setValue(branch, { emitEvent: false });
  }

  displayOfficer(user: User | null): string { return user ? user.fullName : ''; }
  displayBranch(branch: Branch | null): string { return branch ? `${branch.branchName} (${branch.branchCode})` : ''; }

  // ── Audit Reports ─────────────────────────────────────────────
  loadReports() {
    this.reportSvc.getAll().subscribe(r => {
      this.reports = r;
      this.reportsDataSource.data = r;
    });
  }

  onReportSearch(event: Event) {
    const filter = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.reportSearch = filter;
    this.reportsDataSource.filter = filter;
    this.reportsDataSource.filterPredicate = (data: ComplianceAuditReport, f: string) =>
      data.officerName.toLowerCase().includes(f) ||
      data.branchName.toLowerCase().includes(f) ||
      data.branchCode.toLowerCase().includes(f) ||
      data.year.toString().includes(f) ||
      data.auditTeamLeadName.toLowerCase().includes(f);
  }

  rectifiedPercent(r: ComplianceAuditReport): number {
    if (r.totalFindings === 0) return 0;
    return Math.round((r.rectifiedFindings / r.totalFindings) * 100);
  }
}
