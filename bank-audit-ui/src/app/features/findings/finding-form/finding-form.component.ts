import {
  Component, Inject, OnInit, OnDestroy, HostListener, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FindingService } from '../../../core/services/finding.service';
import { AuditFinding, CreateFindingRequest, UpdateFindingRequest, RiskRating } from '../../../core/models/finding.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const CATEGORIES: string[] = [
  '3rd Party Affidavit/Consent/Identification',
  'Acceptance of Sanction/Renewal/ Time Extension Letter/Ho Sanction',
  'Account Title/Address Mismatch',
  'Account Turnover Poor/Nill',
  'Accounts /GL Balance/GL Mismatch/MIS Report Mismatch',
  'Active in the system beyond expiry/closure/(liability/ARV not reversed)',
  'ADMINISTRATIVE LAPSES/ Violation Of BOPM/Violation Circular',
  'AML & ATF Circulars/Files/Endorsement/Previous Irregularities',
  'AML TRAINING/CERTIFICATE/EXAM/KNOWLEDGE',
  'AOF PENDING/DISPUTE/PRESERVE/RECONCILE',
  'Approved Building Plan/Letter/Layout/Allotment',
  'ARV Unadjusted',
  'Audited/Projected Financial',
  'Bank Guarantee',
  'BCU Committee/ Meeting Minutes',
  'BIA /PARTITION/POA/IMMEDIATE DEED',
  'Bill of Entry/Lading',
  'BLA Opinion/Clarification/Satisfaction',
  'Branch/Head Office Sanction/CRMD Approval',
  'CALL/VISIT REPORT/CPV',
  'CASE Filed/AGT BANK/COURT',
  'Cash Deposit/Payment/MGT',
  'Certificate/License',
  'Charge Form/Fill Up/Thumb Impression/Unstamped',
  'Cheque Book Management',
  'Commission unrealized (issuing/acceptance/cancellation/shipping guarantee/discrepancy/advising/transferring/confirming/others)',
  'Credit Rating/Credit Report',
  'CS/SA/RS/BS/PS/DP/ROR KHATIAN',
  'CTR/STR/SAR Analysis/ Alert Pending',
  'Customer Approach/Board Resolution',
  'Customer not reviewed (RBG/TTP/ITP/others)',
  'Customer/Nominee/Guarantor Photograph/Verification',
  'DCFCL/QOR',
  'DEBIT/CREDIT/PREPAID/CAPTURED CARD',
  'Deceased Customer Documentation',
  'Deed Of Undertaking/Agreement/Further Charge/Tag',
  'Deed Of Undertaking/Agreement/Further Charge/Tag/Deed Documents',
  'Differnce LC Liabiity',
  'Discrepant Document',
  'Documentation Register/Certificate',
  'Documents not found/uploaded in Docuware',
  'Dormant / Inoperative Account/legacy account',
  'DPS Overdue/Zero/Others',
  'EC/NEC/UNDERTAKING GAP PERIOD',
  'EGP/EMF Register/Earnest Meney',
  'EXP/IMP/TM/C Form',
  'EXPENDITURE APPROVAL/EXCESS',
  'Export- Operational lapses',
  'Fake Deed/Wrong Plot/Dag no/Mismatch/Defective Deed',
  'FDR Margin/Lien/Receipt/Discharge/Input/Another Account',
  'Fixed Asset Mismatch/Tagging/CCTV/GUN/Note Counting',
  'GROUND PAY RECEIPT',
  'HOLDING/DCC TAX',
  'HS Code differed',
  'IMPORT WITHOUT LC',
  'INSURANCE POLICY/UNDERTAKING',
  'Interest Suspense/Application/Servicing/Rate/Spread',
  'KYC /HIGH /LOW RISK REVIEW/BLANK/SDD/CDD/EDD/PENDING',
  'Lapses of Documents (agreement/contract/undertaking/PI/indent/LC copy/bill of entry/CI/short shipment certificate/shipping guarantee copy/TIN/BIN/others)',
  'LC Acceptance/commission/Cancellation Charge',
  'LC Opened but No Export',
  'Letter of Consent/Identification/Introduction/Photograph',
  'Letter of Nomination/Introduction/Partnership',
  'Lien/Letter of Authority/Encashment',
  'Loan Renewal/Conversion/Reschedule/Extension',
  'Loan Repayment',
  'Locker related Irregularities',
  'LTR',
  'Margin not built up/realized against LTR/accepted bill/guarantee/others',
  'Mobile No Same/ Missing/ Wrong/Multiple CIF',
  'MOUZA MAP',
  'Mutation Khatian/Separate/Joint/DCR',
  'NID of Borrower/Guarantor/Spouse/Director/Wrong/Missing',
  'NO Export BTB maximum',
  'NOC from Bank/RAJUK/HOUSING',
  'Not properly  processed (not dully filled up/not signed/not endorsed/not marked/not stamped)',
  'OTHERS',
  'Overdue Bill of Entry (Full/Partial)',
  'Overdue/EOL/Expired/EMI',
  'Payment Order /DD PAYABLE/Unclaimed Deposit',
  'Personal Net worth Statement',
  'PG of Spouse/Borrower/Guarantor/Director',
  'Physical Verification Report',
  'Price Verification',
  'Proceeds overdue (not realised/EXP overdue)',
  'Reconciliation not done (GL/LC register/bill register/others)',
  'Remittance Disbursement Schedule/Remittance Operation',
  'REVENUE/ADHESIVE/Prize bond/Challan',
  'RJSC/Charge Creation/Floating/MOA/Certificate of Incorporation',
  'RM/RIGPA/REDEMPTION DEED',
  'RMD/RIGPA Not Executed',
  'Sale/Lease/Heba/WILL/IPA/Rectification Deed',
  'Security MICR Cheque/Forwarding',
  'Self Assesment Report',
  'Shipping Guarantee/Shipping Documents',
  'Sign/Photo/Document Verification',
  'Signature Card Upload',
  'SIGNBOARD OF MORTGAGE PROPERTY/VEHICLE',
  'SOURCE OF FUND',
  'Stock Report / IGPA / NIGPA / Receivables / Hypothecation',
  'Stop Payment MGT',
  'Student File',
  'SUCESSION/WARISAN/INHERITANCE CERTIFICATE',
  'TIN/Tax Return Certificate',
  'Title Deed Certified/Report',
  'TRADE LICENSE',
  'Transacton profile Review/Monitoring',
  'Unusual Credit Facilities/Operation',
  'Valuation Report/Coverage',
  'Vault Management& Strong Room',
  'Verification not done (sign/authentication/price/NID/TIN/CPV/others)',
  'Voucher/Report Management',
  'WO ASSIGNMENT/CONFIRMATION/VERIFICATION/FAKE',
  'WO Bill Deduction/WPC/IPC/Progress/Sepeate Ac',
];

export interface GridFinding {
  _key: string;
  id?: number;
  slNo: string;
  nameOfCustomers: string;
  findingDetails: string;
  category: string;
  lapsesOriginated: string;
  noOfInstances: string;
  findingArea: string;
  riskRating: string;
  complianceStatus: string;
  lapsesType: string;
  rowState: 'new' | 'modified' | 'unchanged' | 'deleted';
  _catSearch: string;
  _catOpen: boolean;
  _filteredCats: string[];
}

@Component({
  selector: 'app-finding-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressBarModule, MatTooltipModule
  ],
  templateUrl: './finding-form.component.html',
  styleUrl: './finding-form.component.css'
})
export class FindingFormComponent implements OnInit, OnDestroy {
  rows: GridFinding[] = [];
  selectedKeys = new Set<string>();
  saving = false;
  saveProgress = 0;
  saveResults: { saved: number; failed: number } | null = null;

  bulkField = '';
  bulkValue = '';

  dragActive = false;
  dragSrcIdx = -1;
  dragSrcRow: GridFinding | null = null;
  dragCurIdx = -1;

  private _keyCounter = 0;
  private pasteHandler!: (e: ClipboardEvent) => void;

  readonly AREAS = ['AML', 'Credit', 'GB', 'TFO'];
  readonly RISK_RATINGS = ['High', 'Medium', 'Low'];
  readonly STATUSES = ['Rectified', 'Unrectified', 'Transfer'];
  readonly LAPSES_TYPES = ['Operational', 'Documentation'];
  readonly ALL_CATS = CATEGORIES;
  readonly BULK_FIELDS = [
    { value: 'findingArea',      label: 'Finding Area' },
    { value: 'riskRating',       label: 'Risk Rating' },
    { value: 'complianceStatus', label: 'Status' },
    { value: 'lapsesType',       label: 'Lapses Type' },
    { value: 'lapsesOriginated', label: 'Lapses Originated' },
  ];

  constructor(
    public dialogRef: MatDialogRef<FindingFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reportId: number; findings?: AuditFinding[] },
    private findingSvc: FindingService,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    dialogRef.updateSize('98vw', '94vh');
  }

  ngOnInit() {
    if (this.data.findings?.length) {
      this.rows = this.data.findings.map(f => this.fromFinding(f));
    } else {
      this.addRow();
    }
    this.pasteHandler = (e: ClipboardEvent) => this.handlePaste(e);
    document.addEventListener('paste', this.pasteHandler);
  }

  ngOnDestroy() {
    document.removeEventListener('paste', this.pasteHandler);
  }

  private nextKey(): string {
    return `k${++this._keyCounter}`;
  }

  private fromFinding(f: AuditFinding): GridFinding {
    return {
      _key: this.nextKey(),
      id: f.id,
      slNo: f.slNo ?? '',
      nameOfCustomers: f.nameOfCustomers ?? '',
      findingDetails: f.findingDetails ?? '',
      category: f.category ?? '',
      lapsesOriginated: f.lapsesOriginated ?? '',
      noOfInstances: f.noOfInstances ?? '',
      findingArea: f.findingArea ?? '',
      riskRating: f.riskRating ?? 'Medium',
      complianceStatus: f.complianceStatus ?? 'Unrectified',
      lapsesType: f.lapsesType ?? '',
      rowState: 'unchanged',
      _catSearch: '', _catOpen: false, _filteredCats: CATEGORIES
    };
  }

  private makeEmptyRow(): GridFinding {
    return {
      _key: this.nextKey(),
      slNo: '', nameOfCustomers: '', findingDetails: '', category: '',
      lapsesOriginated: '', noOfInstances: '', findingArea: '',
      riskRating: 'Medium', complianceStatus: 'Unrectified', lapsesType: '',
      rowState: 'new',
      _catSearch: '', _catOpen: false, _filteredCats: CATEGORIES
    };
  }

  // ── Row management ────────────────────────────────────────────────
  get visibleRows(): GridFinding[] {
    return this.rows.filter(r => r.rowState !== 'deleted');
  }

  addRow() {
    this.rows.push(this.makeEmptyRow());
  }

  duplicateRow(row: GridFinding) {
    const clone: GridFinding = {
      ...row, _key: this.nextKey(), id: undefined,
      rowState: 'new', _catSearch: '', _catOpen: false, _filteredCats: CATEGORIES
    };
    const idx = this.rows.indexOf(row);
    this.rows.splice(idx + 1, 0, clone);
  }

  removeRow(row: GridFinding) {
    if (row.id) {
      row.rowState = 'deleted';
    } else {
      this.rows = this.rows.filter(r => r._key !== row._key);
    }
    this.selectedKeys.delete(row._key);
  }

  markDirty(row: GridFinding) {
    if (row.rowState === 'unchanged') row.rowState = 'modified';
  }

  // ── Selection ─────────────────────────────────────────────────────
  toggleSelect(key: string) {
    if (this.selectedKeys.has(key)) this.selectedKeys.delete(key);
    else this.selectedKeys.add(key);
  }

  toggleAll() {
    if (this.allSelected) this.selectedKeys.clear();
    else this.visibleRows.forEach(r => this.selectedKeys.add(r._key));
  }

  get allSelected(): boolean {
    const v = this.visibleRows;
    return v.length > 0 && v.every(r => this.selectedKeys.has(r._key));
  }

  get selectedCount(): number { return this.selectedKeys.size; }

  deleteSelected() {
    [...this.selectedKeys].forEach(k => {
      const r = this.rows.find(x => x._key === k);
      if (r) this.removeRow(r);
    });
  }

  // ── Bulk edit ─────────────────────────────────────────────────────
  applyBulkEdit() {
    if (!this.bulkField || !this.bulkValue) return;
    this.rows.forEach(r => {
      if (this.selectedKeys.has(r._key) && r.rowState !== 'deleted') {
        (r as any)[this.bulkField] = this.bulkValue;
        this.markDirty(r);
      }
    });
    this.bulkField = '';
    this.bulkValue = '';
  }

  // ── Category dropdown ─────────────────────────────────────────────
  openCat(row: GridFinding, e: MouseEvent) {
    e.stopPropagation();
    const wasOpen = row._catOpen;
    this.rows.forEach(r => { r._catOpen = false; });
    if (!wasOpen) {
      row._catSearch = '';
      row._filteredCats = CATEGORIES;
      row._catOpen = true;
      setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>(
          `.cat-search-input[data-rowkey="${row._key}"]`
        );
        el?.focus();
      }, 30);
    }
  }

  filterCat(row: GridFinding) {
    const s = row._catSearch.toLowerCase();
    row._filteredCats = s ? CATEGORIES.filter(c => c.toLowerCase().includes(s)) : CATEGORIES;
  }

  selectCat(row: GridFinding, cat: string, e: MouseEvent) {
    e.stopPropagation();
    row.category = cat;
    row._catOpen = false;
    this.markDirty(row);
  }

  @HostListener('document:click')
  closeAllCats() {
    if (this.rows.some(r => r._catOpen)) {
      this.rows.forEach(r => { r._catOpen = false; r._catSearch = ''; r._filteredCats = CATEGORIES; });
    }
  }

  // ── Clipboard paste ───────────────────────────────────────────────
  private handlePaste(e: ClipboardEvent) {
    if (!document.activeElement?.closest('.grid-scroll')) return;
    const text = e.clipboardData?.getData('text/plain') ?? '';
    if (!text.trim()) return;
    e.preventDefault();

    const cols = [
      'slNo', 'nameOfCustomers', 'findingDetails', 'category',
      'lapsesOriginated', 'noOfInstances', 'findingArea',
      'riskRating', 'complianceStatus', 'lapsesType'
    ];
    const lines = text.trim().split('\n').filter(l => l.trim());
    lines.forEach(line => {
      const row = this.makeEmptyRow();
      line.split('\t').forEach((v, i) => {
        if (i < cols.length) (row as any)[cols[i]] = v.trim();
      });
      this.rows.push(row);
    });
    this.snack.open(`Pasted ${lines.length} row(s)`, 'OK', { duration: 2000 });
    this.cdr.detectChanges();
  }

  // ── Drag fill ─────────────────────────────────────────────────────
  startFill(e: MouseEvent, row: GridFinding, idx: number) {
    e.preventDefault();
    e.stopPropagation();
    this.dragActive = true;
    this.dragSrcRow = row;
    this.dragSrcIdx = idx;
    this.dragCurIdx = idx;

    const onMove = (me: MouseEvent) => {
      const el = document.elementFromPoint(me.clientX, me.clientY)?.closest('[data-rowidx]');
      if (el) {
        const i = parseInt(el.getAttribute('data-rowidx') ?? String(idx));
        if (i !== this.dragCurIdx) { this.dragCurIdx = i; this.cdr.markForCheck(); }
      }
    };
    const onUp = () => {
      if (this.dragActive && this.dragSrcRow && this.dragCurIdx !== this.dragSrcIdx) {
        this.applyFill(this.dragSrcIdx, this.dragCurIdx, this.dragSrcRow);
      }
      this.dragActive = false;
      this.dragSrcRow = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      this.cdr.markForCheck();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  private applyFill(fromIdx: number, toIdx: number, src: GridFinding) {
    const start = Math.min(fromIdx, toIdx);
    const end = Math.max(fromIdx, toIdx);
    const fields: (keyof GridFinding)[] = [
      'slNo', 'nameOfCustomers', 'findingDetails', 'category',
      'lapsesOriginated', 'noOfInstances', 'findingArea',
      'riskRating', 'complianceStatus', 'lapsesType'
    ];
    this.visibleRows.slice(start, end + 1).forEach(r => {
      if (r._key !== src._key) {
        fields.forEach(f => (r as any)[f] = (src as any)[f]);
        this.markDirty(r);
      }
    });
  }

  isFillHighlight(idx: number): boolean {
    if (!this.dragActive) return false;
    const s = Math.min(this.dragSrcIdx, this.dragCurIdx);
    const e = Math.max(this.dragSrcIdx, this.dragCurIdx);
    return idx >= s && idx <= e;
  }

  // ── Keyboard ──────────────────────────────────────────────────────
  onCellKey(e: KeyboardEvent, rowIdx: number, colIdx: number) {
    if (e.key === 'Enter' && !(e.target as HTMLElement).matches('textarea')) {
      e.preventDefault();
      const next = document.querySelector<HTMLElement>(
        `[data-rowidx="${rowIdx + 1}"] [data-colidx="${colIdx}"]`
      );
      next?.focus();
    }
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      const row = this.visibleRows[rowIdx];
      if (row) this.applyFill(rowIdx, this.visibleRows.length - 1, row);
    }
  }

  // ── Export ────────────────────────────────────────────────────────
  exportCsv() {
    const headers = ['SL No','Name of Customers','Finding Details','Category',
                     'Lapses Originated','No of Instances','Finding Area',
                     'Risk Rating','Compliance Status','Lapses Type'];
    const lines = this.visibleRows.map(r =>
      [r.slNo, r.nameOfCustomers, r.findingDetails, r.category,
       r.lapsesOriginated, r.noOfInstances, r.findingArea,
       r.riskRating, r.complianceStatus, r.lapsesType]
        .map(v => `"${(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `findings_report${this.data.reportId}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ── Save all ──────────────────────────────────────────────────────
  saveAll() {
    type Op = { obs: Observable<any>; row: GridFinding; type: 'create' | 'update' | 'delete' };
    const ops: Op[] = [];

    this.rows.forEach(r => {
      if (r.rowState === 'new')
        ops.push({ obs: this.findingSvc.create(this.toCreate(r)), row: r, type: 'create' });
      else if (r.rowState === 'modified' && r.id)
        ops.push({ obs: this.findingSvc.update(r.id, this.toUpdate(r)), row: r, type: 'update' });
      else if (r.rowState === 'deleted' && r.id)
        ops.push({ obs: this.findingSvc.delete(r.id), row: r, type: 'delete' });
    });

    if (!ops.length) {
      this.snack.open('No changes to save', 'OK', { duration: 2000 });
      return;
    }

    this.saving = true;
    this.saveProgress = 0;
    this.saveResults = null;
    let done = 0, saved = 0, failed = 0;
    const ERR = '__ERR__';

    ops.forEach(op => {
      op.obs.pipe(catchError(() => of(ERR))).subscribe(res => {
        done++;
        if (res !== ERR) {
          if (op.type === 'create' && res?.id) op.row.id = res.id;
          if (op.type === 'delete') this.rows = this.rows.filter(r => r._key !== op.row._key);
          else op.row.rowState = 'unchanged';
          saved++;
        } else {
          failed++;
        }
        this.saveProgress = Math.round((done / ops.length) * 100);
        if (done === ops.length) {
          this.saving = false;
          this.saveResults = { saved, failed };
          if (failed === 0) {
            this.snack.open(`${saved} finding(s) saved`, 'OK', { duration: 3000 });
            this.dialogRef.close(true);
          } else {
            this.snack.open(`${saved} saved · ${failed} failed`, 'Dismiss', { duration: 6000 });
          }
        }
      });
    });
  }

  private toCreate(r: GridFinding): CreateFindingRequest {
    return {
      complianceAuditReportId: this.data.reportId,
      slNo: r.slNo, nameOfCustomers: r.nameOfCustomers,
      findingDetails: r.findingDetails, category: r.category,
      lapsesOriginated: r.lapsesOriginated, noOfInstances: r.noOfInstances,
      findingArea: r.findingArea, riskRating: r.riskRating as RiskRating,
      complianceStatus: r.complianceStatus, lapsesType: r.lapsesType
    };
  }

  private toUpdate(r: GridFinding): UpdateFindingRequest {
    return {
      slNo: r.slNo, nameOfCustomers: r.nameOfCustomers,
      findingDetails: r.findingDetails, category: r.category,
      lapsesOriginated: r.lapsesOriginated, noOfInstances: r.noOfInstances,
      findingArea: r.findingArea, riskRating: r.riskRating as RiskRating,
      complianceStatus: r.complianceStatus, lapsesType: r.lapsesType
    };
  }
}
