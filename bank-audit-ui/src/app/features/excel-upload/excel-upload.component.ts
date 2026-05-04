import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { ExcelUploadService, UploadSummary } from '../../core/services/excel-upload.service';

@Component({
  selector: 'app-excel-upload',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatSnackBarModule, MatTableModule, MatDividerModule
  ],
  templateUrl: './excel-upload.component.html',
  styleUrl: './excel-upload.component.css'
})
export class ExcelUploadComponent implements OnInit {
  selectedFile: File | null = null;
  uploading = false;
  lastResult: { imported: number; fileName: string } | null = null;

  summaryColumns = ['fileName', 'uploadedAt', 'recordCount'];
  uploadHistory: UploadSummary[] = [];
  loadingHistory = false;

  constructor(
    private uploadSvc: ExcelUploadService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file && !file.name.match(/\.xlsx?$/i)) {
      this.snack.open('Please select an .xlsx or .xls file.', 'OK', { duration: 4000 });
      input.value = '';
      return;
    }
    this.selectedFile = file;
    this.lastResult = null;
  }

  upload() {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.uploadSvc.upload(this.selectedFile).subscribe({
      next: (res) => {
        this.uploading = false;
        this.lastResult = res;
        this.selectedFile = null;
        this.snack.open(`Imported ${res.imported} records from "${res.fileName}"`, 'OK', { duration: 5000 });
        this.loadHistory();
      },
      error: (err) => {
        this.uploading = false;
        this.snack.open(err.error?.message || 'Upload failed', 'OK', { duration: 5000 });
      }
    });
  }

  clearFile() {
    this.selectedFile = null;
    this.lastResult = null;
  }

  private loadHistory() {
    this.loadingHistory = true;
    this.uploadSvc.getSummary().subscribe({
      next: (data) => { this.uploadHistory = data; this.loadingHistory = false; },
      error: () => { this.loadingHistory = false; }
    });
  }

  formatDate(iso: string) {
    return new Date(iso).toLocaleString();
  }
}
