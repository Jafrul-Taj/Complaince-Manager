import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { HttpEventType } from '@angular/common/http';
import {
  ExcelUploadService, ReconcileResult, UploadResult, UploadSummary
} from '../../core/services/excel-upload.service';

@Component({
  selector: 'app-excel-upload',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatSnackBarModule, MatTableModule,
    MatDividerModule, MatChipsModule
  ],
  templateUrl: './excel-upload.component.html',
  styleUrl: './excel-upload.component.css'
})
export class ExcelUploadComponent implements OnInit {
  selectedFile: File | null = null;
  uploading    = false;
  uploadProgress = 0;       // 0-100 while bytes are in flight
  processing   = false;     // true once bytes arrive, server is crunching

  lastResult: UploadResult | null = null;
  showRowErrors = false;

  summaryColumns = ['fileName', 'uploadedAt', 'recordCount', 'reconciledCount', 'status'];
  uploadHistory: UploadSummary[] = [];
  loadingHistory = false;

  reconciling    = false;
  reconcileResult: ReconcileResult | null = null;

  constructor(
    private uploadSvc: ExcelUploadService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() { this.loadHistory(); }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    if (file && !file.name.match(/\.xlsx?$/i)) {
      this.snack.open('Please select an .xlsx or .xls file.', 'OK', { duration: 4000 });
      input.value = '';
      return;
    }
    this.selectedFile  = file;
    this.lastResult    = null;
    this.showRowErrors = false;
  }

  upload() {
    if (!this.selectedFile) return;
    this.uploading      = true;
    this.uploadProgress = 0;
    this.processing     = false;
    this.lastResult     = null;
    this.showRowErrors  = false;

    this.uploadSvc.upload(this.selectedFile).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = event.total ?? this.selectedFile!.size;
          this.uploadProgress = Math.round(100 * event.loaded / total);
          if (this.uploadProgress >= 100) this.processing = true;

        } else if (event.type === HttpEventType.Response) {
          this.uploading      = false;
          this.processing     = false;
          this.uploadProgress = 100;
          this.lastResult     = event.body!;
          this.selectedFile   = null;
          this.snack.open(
            `Imported ${event.body!.imported.toLocaleString()} records ` +
            `from ${event.body!.sheetsProcessed} sheet(s)`,
            'OK', { duration: 6000 }
          );
          this.loadHistory();
        }
      },
      error: (err) => {
        this.uploading      = false;
        this.processing     = false;
        this.uploadProgress = 0;
        const msg = err.error?.message || err.error?.errors
          ? (err.error.message ?? JSON.stringify(err.error.errors))
          : 'Upload failed — check the server logs.';
        this.snack.open(msg, 'OK', { duration: 6000 });
      }
    });
  }

  clearFile() {
    this.selectedFile   = null;
    this.lastResult     = null;
    this.uploadProgress = 0;
    this.showRowErrors  = false;
  }

  reconcile() {
    this.reconciling     = true;
    this.reconcileResult = null;
    this.uploadSvc.reconcile().subscribe({
      next: (res) => {
        this.reconciling     = false;
        this.reconcileResult = res;
        this.snack.open(
          `Reconciled: ${res.rowsReconciled} rows → ` +
          `${res.findingsCreated} findings, ${res.reportsCreated} reports, ` +
          `${res.assignmentsCreated} assignments`,
          'OK', { duration: 8000 }
        );
        this.loadHistory();
      },
      error: (err) => {
        this.reconciling = false;
        this.snack.open(err.error?.message || 'Reconcile failed', 'OK', { duration: 5000 });
      }
    });
  }

  get hasUnreconciled(): boolean {
    return this.uploadHistory.some(h => h.recordCount > h.reconciledCount);
  }

  get uploadStatusLabel(): string {
    if (this.processing)                return 'Processing on server…';
    if (this.uploadProgress > 0 && this.uploadProgress < 100)
      return `Uploading… ${this.uploadProgress}%`;
    return 'Uploading…';
  }

  private loadHistory() {
    this.loadingHistory = true;
    this.uploadSvc.getSummary().subscribe({
      next:  (data) => { this.uploadHistory = data; this.loadingHistory = false; },
      error: ()     => { this.loadingHistory = false; }
    });
  }

  formatDate(iso: string) {
    return new Date(iso).toLocaleString();
  }

  fileSizeMb(bytes: number): string {
    return (bytes / 1024 / 1024).toFixed(2);
  }
}
