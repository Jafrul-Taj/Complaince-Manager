import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AssignmentService } from '../../../core/services/assignment.service';
import { UserService } from '../../../core/services/user.service';
import { BranchService } from '../../../core/services/branch.service';
import { Assignment } from '../../../core/models/assignment.model';
import { User } from '../../../core/models/user.model';
import { Branch } from '../../../core/models/branch.model';
import { IccdEmployeeService } from '../../../core/services/iccd-employee.service';

@Component({
  selector: 'app-assignment-manager',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatAutocompleteModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatTableModule, MatSortModule, MatSnackBarModule, MatChipsModule
  ],
  templateUrl: './assignment-manager.component.html',
  styleUrl: './assignment-manager.component.css'
})
export class AssignmentManagerComponent implements OnInit, AfterViewInit {
  officers: User[] = [];
  branches: Branch[] = [];
  assignments: Assignment[] = [];
  dataSource = new MatTableDataSource<Assignment>();
  @ViewChild(MatSort) sort!: MatSort;
  columns = ['officer', 'branch', 'year', 'actions'];
  saving = false;
  editingId: number | null = null;
  searchTerm = '';

  officerSearchControl = new FormControl<string | User | null>('');
  branchSearchControl = new FormControl<string | Branch | null>('');
  filteredOfficers$: Observable<User[]> = new Observable<User[]>();
  filteredBranches$: Observable<Branch[]> = new Observable<Branch[]>();

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
    private iccdSvc: IccdEmployeeService,
    private userSvc: UserService,
    private branchSvc: BranchService,
    private snack: MatSnackBar
  ) {
    this.years = Array.from({ length: 10 }, (_, i) => this.currentYear - 5 + i);
  }

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
      if (typeof value === 'string') {
        this.form.get('userId')?.setValue(null);
      }
    });

    this.branchSearchControl.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.form.get('branchId')?.setValue(null);
      }
    });

    this.userSvc.getAll().subscribe(users =>
      this.officers = users.filter(u => u.role === 'ComplianceOfficer' && u.isActive)
    );
    this.branchSvc.getAll().subscribe(b => this.branches = b.filter(x => x.isActive));
    this.loadAssignments();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  loadAssignments() {
    this.assignSvc.getAll().subscribe(a => {
      this.assignments = a;
      this.dataSource.data = a;
      this.dataSource.filter = this.searchTerm || '';
    });
  }

  onSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchTerm = filterValue;
    this.dataSource.filter = filterValue;
    this.dataSource.filterPredicate = (data: Assignment, filter: string) => {
      const userMatch = data.userFullName.toLowerCase().includes(filter);
      const branchNameMatch = data.branchName.toLowerCase().includes(filter);
      const branchCodeMatch = data.branchCode.toLowerCase().includes(filter);
      const yearMatch = data.year.toString().includes(filter);
      return userMatch || branchNameMatch || branchCodeMatch || yearMatch;
    };
  }

  get isEditMode(): boolean {
    return this.editingId !== null;
  }

  editAssignment(assignment: Assignment) {
    this.editingId = assignment.id;
    this.form.patchValue({
      userId: assignment.userId,
      branchId: assignment.branchId,
      year: assignment.year
    });

    const officer = this.officers.find(u => u.id === assignment.userId) ?? null;
    const branch = this.branches.find(b => b.id === assignment.branchId) ?? null;
    this.officerSearchControl.setValue(officer, { emitEvent: false });
    this.branchSearchControl.setValue(branch, { emitEvent: false });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({
      userId: null,
      branchId: null,
      year: this.currentYear
    });
    this.officerSearchControl.setValue('');
    this.branchSearchControl.setValue('');
  }

  save() {
    if (this.form.invalid) return;
    if (this.isEditMode) {
      this.update();
      return;
    }
    this.assign();
  }

  update() {
    if (this.editingId === null || this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    this.assignSvc.update(this.editingId, {
      userId: v.userId!,
      branchId: v.branchId!,
      year: v.year!
    }).subscribe({
      next: () => {
        this.snack.open('Assignment updated', 'OK', { duration: 3000 });
        this.saving = false;
        this.cancelEdit();
        this.loadAssignments();
      },
      error: () => {
        this.saving = false;
        this.snack.open('Failed to update assignment', 'OK', { duration: 3000 });
      }
    });
  }

  private getSearchValue(value: string | User | Branch | null): string {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    return 'fullName' in value ? value.fullName : value.branchName;
  }

  private filterOfficers(value: string | User | null): User[] {
    const filterValue = this.getSearchValue(value).toLowerCase().trim();
    return filterValue
      ? this.officers.filter(u => u.fullName.toLowerCase().includes(filterValue))
      : this.officers;
  }

  private filterBranches(value: string | Branch | null): Branch[] {
    const filterValue = this.getSearchValue(value).toLowerCase().trim();
    return filterValue
      ? this.branches.filter(b =>
          b.branchName.toLowerCase().includes(filterValue) ||
          b.branchCode.toLowerCase().includes(filterValue)
        )
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

  displayOfficer(user: User | null): string {
    return user ? user.fullName : '';
  }

  displayBranch(branch: Branch | null): string {
    return branch ? `${branch.branchName} (${branch.branchCode})` : '';
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
