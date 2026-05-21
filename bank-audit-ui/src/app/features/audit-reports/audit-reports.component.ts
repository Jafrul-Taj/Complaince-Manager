import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { ComplianceAuditReportService } from '../../core/services/compliance-audit-report.service';
import { IccdEmployeeService } from '../../core/services/iccd-employee.service';
import { BranchService } from '../../core/services/branch.service';
import { ComplianceAuditReport } from '../../core/models/compliance-audit-report.model';
import { IccdEmployee } from '../../core/models/iccd-employee.model';
import { Branch } from '../../core/models/branch.model';

@Component({
  selector: 'app-audit-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    MatDividerModule, MatTooltipModule
  ],
  templateUrl: './audit-reports.component.html',
  styleUrl: './audit-reports.component.css'
})
export class AuditReportsComponent implements OnInit, OnDestroy {
  branchId: number | null = null;
  branch: Branch | null = null;
  reports: ComplianceAuditReport[] = [];
  employees: IccdEmployee[] = [];
  loading = true;
  showCreateForm = false;
  saving = false;

  // Edit state
  isEditMode = false;
  editingReport: ComplianceAuditReport | null = null;

  currentYear = new Date().getFullYear();
  years: number[] = Array.from({ length: 10 }, (_, i) => this.currentYear - 4 + i);

  form = this.fb.group({
    year:            [this.currentYear, Validators.required],
    auditTeamLeadId: ['', Validators.required],
    auditBaseDate:   [null as Date | null, Validators.required]
  });

  // Separate control for the autocomplete input — holds typed string OR selected IccdEmployee
  leadSearchCtrl = new FormControl<IccdEmployee | string>('');
  selectedLead: IccdEmployee | null = null;

  private leadSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private reportSvc: ComplianceAuditReportService,
    private iccdSvc: IccdEmployeeService,
    private branchSvc: BranchService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.branchId = params['branchId'] ? +params['branchId'] : null;
      if (this.branchId) {
        this.loadData();
      } else {
        this.loading = false;
      }
    });

    this.iccdSvc.getAll().subscribe((employees: IccdEmployee[]) => {
      this.employees = employees.filter(e => e.unit === 'Audit' && e.wing === 'RBIA');
    });

    // Clear ID from form when user starts typing again after a selection
    this.leadSub = this.leadSearchCtrl.valueChanges.subscribe(val => {
      if (typeof val === 'string' && this.selectedLead) {
        this.selectedLead = null;
        this.form.patchValue({ auditTeamLeadId: '' });
      }
    });
  }

  ngOnDestroy() {
    this.leadSub?.unsubscribe();
  }

  // ── Autocomplete helpers ──────────────────────────────────────────

  displayEmployee = (val: IccdEmployee | string | null): string => {
    if (!val) return '';
    if (typeof val === 'object') return `${val.name} — ${val.designation}`;
    return val;
  };

  get filteredLeads(): IccdEmployee[] {
    const v = this.leadSearchCtrl.value;
    if (!v || typeof v !== 'string') return this.employees;
    const s = v.toLowerCase();
    return this.employees.filter(e =>
      e.name.toLowerCase().includes(s) || e.designation.toLowerCase().includes(s)
    );
  }

  selectLead(event: MatAutocompleteSelectedEvent) {
    const emp: IccdEmployee = event.option.value;
    this.selectedLead = emp;
    this.form.patchValue({ auditTeamLeadId: emp.id });
    this.leadCtrl.markAsTouched();
  }

  clearLead() {
    this.selectedLead = null;
    this.form.patchValue({ auditTeamLeadId: '' });
    this.leadSearchCtrl.setValue('', { emitEvent: false });
    this.leadCtrl.markAsTouched();
  }

  // ── Data loading ──────────────────────────────────────────────────

  private loadData() {
    this.loading = true;
    this.branchSvc.getById(this.branchId!).subscribe({
      next: b => { this.branch = b; },
      error: () => {}
    });
    this.reportSvc.getByBranch(this.branchId!).subscribe({
      next: data => { this.reports = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openFindings(report: ComplianceAuditReport) {
    this.router.navigate(['/app/findings'], {
      queryParams: { reportId: report.id }
    });
  }

  goBack() {
    this.router.navigate(['/app/my-assignments']);
  }

  // ── Form open/close ───────────────────────────────────────────────

  toggleCreateForm() {
    if (this.showCreateForm) {
      this.showCreateForm = false;
      this.resetForm();
    } else {
      this.isEditMode = false;
      this.editingReport = null;
      this.showCreateForm = true;
    }
  }

  openEditForm(r: ComplianceAuditReport) {
    // Close if clicking edit on the already-editing card
    if (this.isEditMode && this.editingReport?.id === r.id) {
      this.showCreateForm = false;
      this.resetForm();
      return;
    }
    this.isEditMode = true;
    this.editingReport = r;
    this.showCreateForm = true;

    const emp = this.employees.find(e => e.id === r.auditTeamLeadId) ?? null;
    this.selectedLead = emp;
    // Set to object so displayEmployee renders the name; emitEvent:false avoids clearing
    this.leadSearchCtrl.setValue(emp ?? r.auditTeamLeadName, { emitEvent: false });

    this.form.patchValue({
      year:            r.year,
      auditTeamLeadId: r.auditTeamLeadId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auditBaseDate:   r.auditBaseDate ? (new Date(r.auditBaseDate) as any) : null
    });
  }

  // ── Submit ────────────────────────────────────────────────────────

  saveReport() {
    if (this.isEditMode) {
      this.updateReport();
    } else {
      this.createReport();
    }
  }

  createReport() {
    if (this.form.invalid || !this.branchId) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const v = this.form.value;
    this.reportSvc.create({
      branchId:        this.branchId,
      year:            v.year!,
      auditTeamLeadId: v.auditTeamLeadId!,
      auditBaseDate:   new Date(v.auditBaseDate!).toISOString()
    }).subscribe({
      next: () => {
        this.snack.open('Audit report created', 'OK', { duration: 3000 });
        this.saving = false;
        this.showCreateForm = false;
        this.resetForm();
        this.loadData();
      },
      error: err => {
        this.saving = false;
        this.snack.open(
          err.error?.message || 'A report for this branch and year already exists',
          'OK', { duration: 4000 }
        );
      }
    });
  }

  updateReport() {
    if (this.form.invalid || !this.editingReport) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const v = this.form.value;
    this.reportSvc.update(this.editingReport.id, {
      auditTeamLeadId: v.auditTeamLeadId!,
      auditBaseDate:   new Date(v.auditBaseDate!).toISOString()
    }).subscribe({
      next: () => {
        this.snack.open('Report updated successfully', 'OK', { duration: 3000 });
        this.saving = false;
        this.showCreateForm = false;
        this.resetForm();
        this.loadData();
      },
      error: err => {
        this.saving = false;
        this.snack.open(err.error?.message || 'Update failed', 'OK', { duration: 4000 });
      }
    });
  }

  // ── Utilities ─────────────────────────────────────────────────────

  rectifiedPercent(r: ComplianceAuditReport): number {
    if (r.totalFindings === 0) return 0;
    return Math.round((r.rectifiedFindings / r.totalFindings) * 100);
  }

  deleteReport(r: ComplianceAuditReport) {
    if (!confirm(`Delete audit report for ${r.branchName} (${r.year})? All associated findings will be unlinked.`)) return;
    this.reportSvc.delete(r.id).subscribe({
      next: () => {
        this.snack.open('Report deleted', 'OK', { duration: 3000 });
        if (this.editingReport?.id === r.id) this.resetForm();
        this.loadData();
      },
      error: () => this.snack.open('Failed to delete report', 'OK', { duration: 3000 })
    });
  }

  formatDate(d: Date | string | null | undefined): string {
    if (!d) return 'Not set';
    try {
      return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'Not set';
    }
  }

  private resetForm() {
    this.form.reset({ year: this.currentYear, auditTeamLeadId: '', auditBaseDate: null });
    this.leadSearchCtrl.setValue('', { emitEvent: false });
    this.selectedLead = null;
    this.isEditMode = false;
    this.editingReport = null;
  }

  get yearCtrl() { return this.form.get('year')!; }
  get leadCtrl() { return this.form.get('auditTeamLeadId')!; }
  get dateCtrl() { return this.form.get('auditBaseDate')!; }
}
