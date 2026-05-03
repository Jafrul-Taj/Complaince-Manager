import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ComplianceAuditReportService } from '../../core/services/compliance-audit-report.service';
import { AssignmentService } from '../../core/services/assignment.service';
import { ComplianceAuditReport } from '../../core/models/compliance-audit-report.model';
import { AssignmentSummary } from '../../core/models/assignment.model';
import { forkJoin } from 'rxjs';

interface YearGroup {
  year: number;
  reports: ComplianceAuditReport[];
}

@Component({
  selector: 'app-my-assignments',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './my-assignments.component.html',
  styleUrl: './my-assignments.component.css'
})
export class MyAssignmentsComponent implements OnInit {
  reports: ComplianceAuditReport[] = [];
  branches: AssignmentSummary[] = [];
  yearGroups: YearGroup[] = [];
  loading = true;

  get totalReports(): number { return this.reports.length; }
  get totalBranches(): number { return this.branches.length; }

  constructor(
    private reportSvc: ComplianceAuditReportService,
    private assignSvc: AssignmentService,
    private router: Router
  ) {}

  ngOnInit() {
    forkJoin({
      reports: this.reportSvc.getMyReports(),
      branches: this.assignSvc.getMySummary()
    }).subscribe({
      next: ({ reports, branches }) => {
        this.reports = reports;
        this.branches = branches;
        this.yearGroups = this.groupByYear(reports);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private groupByYear(reports: ComplianceAuditReport[]): YearGroup[] {
    const map = new Map<number, ComplianceAuditReport[]>();
    for (const r of reports) {
      if (!map.has(r.year)) map.set(r.year, []);
      map.get(r.year)!.push(r);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, reports]) => ({ year, reports }));
  }

  openFindings(report: ComplianceAuditReport) {
    this.router.navigate(['/app/findings'], {
      queryParams: { reportId: report.id, branchId: report.branchId }
    });
  }

  openBranch(branch: AssignmentSummary) {
    this.router.navigate(['/app/audit-reports'], {
      queryParams: { branchId: branch.branchId }
    });
  }
}
