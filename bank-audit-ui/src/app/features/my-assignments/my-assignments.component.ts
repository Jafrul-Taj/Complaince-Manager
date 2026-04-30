import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AssignmentService } from '../../core/services/assignment.service';
import { AssignmentSummary } from '../../core/models/assignment.model';

@Component({
  selector: 'app-my-assignments',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressBarModule, MatTooltipModule
  ],
  templateUrl: './my-assignments.component.html',
  styleUrl: './my-assignments.component.css'
})
export class MyAssignmentsComponent implements OnInit {
  assignments: AssignmentSummary[] = [];
  loading = true;

  constructor(private assignSvc: AssignmentService, private router: Router) {}

  ngOnInit() {
    this.assignSvc.getMySummary().subscribe({
      next: data => { this.assignments = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openFindings(a: AssignmentSummary) {
    this.router.navigate(['/app/findings'], {
      queryParams: { branchId: a.branchId, year: a.year }
    });
  }

  rectifiedPercent(a: AssignmentSummary): number {
    if (a.totalFindings === 0) return 0;
    return Math.round((a.rectifiedFindings / a.totalFindings) * 100);
  }
}
