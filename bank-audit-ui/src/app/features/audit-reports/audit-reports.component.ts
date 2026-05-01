import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
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
    MatProgressSpinnerModule, MatSnackBarModule, MatDividerModule, MatChipsModule
  ],
  templateUrl: './audit-reports.component.html',
  styleUrl: './audit-reports.component.css'
})
export class AuditReportsComponent implements OnInit {
  branchId: number | null = null;
  branch: Branch | null = null;
  reports: ComplianceAuditReport[] = [];
  employees: IccdEmployee[] = [];
  loading = true;
  showCreateForm = false;
  saving = false;

  currentYear = new Date().getFullYear();
  years: number[] = Array.from({ length: 10 }, (_, i) => this.currentYear - 4 + i);

  form = this.fb.group({
    year: [this.currentYear, Validators.required],
    auditTeamLeadId: ['', Validators.required]
  });

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
    this.iccdSvc.getAll().subscribe((e: IccdEmployee[]) => this.employees = e);
  }

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

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.form.reset({ year: this.currentYear, auditTeamLeadId: '' });
    }
  }

  createReport() {
    if (this.form.invalid || !this.branchId) return;
    this.saving = true;
    const v = this.form.value;
    this.reportSvc.create({
      branchId: this.branchId,
      year: v.year!,
      auditTeamLeadId: v.auditTeamLeadId!
    }).subscribe({
      next: () => {
        this.snack.open('Audit report created', 'OK', { duration: 3000 });
        this.saving = false;
        this.showCreateForm = false;
        this.form.reset({ year: this.currentYear, auditTeamLeadId: '' });
        this.loadData();
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(err.error?.message || 'A report for this branch and year already exists', 'OK', { duration: 4000 });
      }
    });
  }

  rectifiedPercent(r: ComplianceAuditReport): number {
    if (r.totalFindings === 0) return 0;
    return Math.round((r.rectifiedFindings / r.totalFindings) * 100);
  }

  deleteReport(r: ComplianceAuditReport) {
    if (!confirm(`Delete audit report for ${r.branchName} (${r.year})? All associated findings will be unlinked.`)) return;
    this.reportSvc.delete(r.id).subscribe({
      next: () => { this.snack.open('Report deleted', 'OK', { duration: 3000 }); this.loadData(); },
      error: () => this.snack.open('Failed to delete report', 'OK', { duration: 3000 })
    });
  }
}
