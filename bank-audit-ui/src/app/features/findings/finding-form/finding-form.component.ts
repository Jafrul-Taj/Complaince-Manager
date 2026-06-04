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
import {
  AuditFinding, CreateFindingRequest, UpdateFindingRequest, RiskRating
} from '../../../core/models/finding.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// ── Category list ─────────────────────────────────────────────────────────────
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

// ── Types ─────────────────────────────────────────────────────────────────────
export type DataKey =
  'slNo' | 'nameOfCustomers' | 'findingDetails' | 'category' |
  'lapsesOriginated' | 'noOfInstances' | 'findingArea' |
  'riskRating' | 'complianceStatus' | 'lapsesType';

export type FilterOperator = 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'equals';
export type RowDensity = 'compact' | 'comfortable' | 'spacious';

export interface ColDef {
  key: DataKey;
  label: string;
  width: number;
  minWidth: number;
  type: 'text' | 'textarea' | 'category' | 'select';
  options?: string[];
}

export interface ColumnFilter {
  mode: 'values' | 'text';
  selectedValues: Set<string>;
  operator: FilterOperator;
  text: string;
}

interface FilterPanel {
  open: boolean;
  searchTerm: string;
  allValues: string[];
  displayedValues: string[];
  pendingChecked: Set<string>;
  mode: 'values' | 'text';
  pendingOperator: FilterOperator;
  pendingText: string;
}

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

const DENSITY_KEY = 'finding-grid-density';

// ── Component ─────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-finding-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressBarModule, MatTooltipModule,
  ],
  templateUrl: './finding-form.component.html',
  styleUrl: './finding-form.component.css',
})
export class FindingFormComponent implements OnInit, OnDestroy {

  // ── Grid data ──────────────────────────────────────────────────────────────
  rows: GridFinding[] = [];

  // ── Column definitions ─────────────────────────────────────────────────────
  readonly COLS: ColDef[] = [
    { key: 'slNo',            label: 'SL No',             width: 70,  minWidth: 50,  type: 'text' },
    { key: 'nameOfCustomers', label: 'Name of Customers', width: 160, minWidth: 100, type: 'text' },
    { key: 'findingDetails',  label: 'Finding Details',   width: 260, minWidth: 150, type: 'textarea' },
    { key: 'category',        label: 'Category',          width: 220, minWidth: 150, type: 'category' },
    { key: 'lapsesOriginated',label: 'Lapses Originated', width: 150, minWidth: 90,  type: 'text' },
    { key: 'noOfInstances',   label: 'No of Instances',   width: 90,  minWidth: 60,  type: 'text' },
    { key: 'findingArea',     label: 'Area',              width: 80,  minWidth: 60,  type: 'select',
      options: ['AML', 'Credit', 'GB', 'TFO'] },
    { key: 'riskRating',      label: 'Risk Rating',       width: 90,  minWidth: 70,  type: 'select',
      options: ['High', 'Medium', 'Low'] },
    { key: 'complianceStatus',label: 'Status',            width: 110, minWidth: 80,  type: 'select',
      options: ['Rectified', 'Unrectified', 'Transfer'] },
    { key: 'lapsesType',      label: 'Lapses Type',       width: 110, minWidth: 80,  type: 'select',
      options: ['Operational', 'Documentation'] },
  ];

  readonly BULK_FIELDS = [
    { value: 'findingArea',       label: 'Finding Area' },
    { value: 'riskRating',        label: 'Risk Rating' },
    { value: 'complianceStatus',  label: 'Status' },
    { value: 'lapsesType',        label: 'Lapses Type' },
    { value: 'lapsesOriginated',  label: 'Lapses Originated' },
  ];

  readonly OPERATORS: { value: FilterOperator; label: string }[] = [
    { value: 'contains',    label: 'Contains' },
    { value: 'notContains', label: 'Does Not Contain' },
    { value: 'startsWith',  label: 'Starts With' },
    { value: 'endsWith',    label: 'Ends With' },
    { value: 'equals',      label: 'Equals' },
  ];

  // ── Active cell & selection ────────────────────────────────────────────────
  activeRow = -1;
  activeCol = -1;
  selStartRow = -1;
  selStartCol = -1;
  selEndRow   = -1;
  selEndCol   = -1;

  // ── Formula bar ───────────────────────────────────────────────────────────
  formulaBarValue = '';

  // ── Undo / Redo ───────────────────────────────────────────────────────────
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private preFocusSnap: string | null = null;

  // ── Bulk edit ─────────────────────────────────────────────────────────────
  selectedKeys = new Set<string>();
  bulkField = '';
  bulkValue = '';

  // ── Save state ────────────────────────────────────────────────────────────
  saving       = false;
  saveProgress = 0;
  saveResults: { saved: number; failed: number } | null = null;

  // ── Fill handle drag ──────────────────────────────────────────────────────
  dragActive  = false;
  dragSrcIdx  = -1;
  dragSrcRow: GridFinding | null = null;
  dragCurIdx  = -1;

  // ── Column resize ─────────────────────────────────────────────────────────
  private resizingCol = -1;

  // ── Column filters ────────────────────────────────────────────────────────
  columnFilters = new Map<DataKey, ColumnFilter>();
  filterPanels: FilterPanel[] = [];

  // ── Row density & UI toggles ──────────────────────────────────────────────
  rowDensity: RowDensity = 'compact';
  legendVisible = false;

  // ── Misc ──────────────────────────────────────────────────────────────────
  private _keyCounter = 0;
  private pasteHandler!: (e: ClipboardEvent) => void;

  // ── Computed ──────────────────────────────────────────────────────────────
  get visibleRows(): GridFinding[] {
    return this.rows.filter(r => r.rowState !== 'deleted');
  }

  get filteredRows(): GridFinding[] {
    if (this.columnFilters.size === 0) return this.visibleRows;
    return this.visibleRows.filter(row => {
      for (const [key, filter] of this.columnFilters) {
        const rawVal = String((row as any)[key] ?? '');
        if (filter.mode === 'values') {
          if (!filter.selectedValues.has(rawVal)) return false;
        } else {
          if (!filter.text) continue;
          const val  = rawVal.toLowerCase();
          const text = filter.text.toLowerCase();
          switch (filter.operator) {
            case 'contains':    if (!val.includes(text))   return false; break;
            case 'notContains': if (val.includes(text))    return false; break;
            case 'startsWith':  if (!val.startsWith(text)) return false; break;
            case 'endsWith':    if (!val.endsWith(text))   return false; break;
            case 'equals':      if (val !== text)          return false; break;
          }
        }
      }
      return true;
    });
  }

  get allSelected(): boolean {
    const v = this.filteredRows;
    return v.length > 0 && v.every(r => this.selectedKeys.has(r._key));
  }

  get selectedCount(): number { return this.selectedKeys.size; }

  get pendingDeleteCount(): number {
    return this.rows.filter(r => r.rowState === 'deleted').length;
  }

  get hasActiveFilters(): boolean { return this.columnFilters.size > 0; }

  get hiddenRowCount(): number {
    return this.visibleRows.length - this.filteredRows.length;
  }

  get selectionInfo(): string {
    if (this.selStartRow < 0 || this.selStartCol < 0) return '';
    const r1 = Math.min(this.selStartRow, this.selEndRow) + 1;
    const r2 = Math.max(this.selStartRow, this.selEndRow) + 1;
    const c1 = Math.min(this.selStartCol, this.selEndCol) + 1;
    const c2 = Math.max(this.selStartCol, this.selEndCol) + 1;
    if (r1 === r2 && c1 === c2) return `Row ${r1}, Col ${c1}`;
    return `R${r1}:R${r2} × C${c1}:C${c2} · ${(r2-r1+1) * (c2-c1+1)} cells`;
  }

  get canUndo(): boolean { return this.undoStack.length > 0; }
  get canRedo(): boolean { return this.redoStack.length > 0; }

  constructor(
    public dialogRef: MatDialogRef<FindingFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reportId: number; findings?: AuditFinding[] },
    private findingSvc: FindingService,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {
    dialogRef.updateSize('100vw', '100vh');
  }

  ngOnInit() {
    // Init filter panels (one per column)
    this.filterPanels = this.COLS.map(() => ({
      open: false,
      searchTerm: '',
      allValues: [],
      displayedValues: [],
      pendingChecked: new Set<string>(),
      mode: 'values' as const,
      pendingOperator: 'contains' as FilterOperator,
      pendingText: '',
    }));

    // Load density preference
    const saved = localStorage.getItem(DENSITY_KEY) as RowDensity | null;
    if (saved === 'compact' || saved === 'comfortable' || saved === 'spacious') {
      this.rowDensity = saved;
    }

    if (this.data.findings?.length) {
      this.rows = this.data.findings.map(f => this.fromFinding(f));
    } else {
      this.addRow();
    }
    this.pasteHandler = (e: ClipboardEvent) => this.handleSystemPaste(e);
    document.addEventListener('paste', this.pasteHandler);
  }

  ngOnDestroy() {
    document.removeEventListener('paste', this.pasteHandler);
  }

  // ── Row factory ───────────────────────────────────────────────────────────
  private nextKey() { return `k${++this._keyCounter}`; }

  private fromFinding(f: AuditFinding): GridFinding {
    return {
      _key: this.nextKey(), id: f.id,
      slNo: f.slNo ?? '', nameOfCustomers: f.nameOfCustomers ?? '',
      findingDetails: f.findingDetails ?? '', category: f.category ?? '',
      lapsesOriginated: f.lapsesOriginated ?? '', noOfInstances: f.noOfInstances ?? '',
      findingArea: f.findingArea ?? '', riskRating: f.riskRating ?? 'Medium',
      complianceStatus: f.complianceStatus ?? 'Unrectified', lapsesType: f.lapsesType ?? '',
      rowState: 'unchanged', _catSearch: '', _catOpen: false, _filteredCats: CATEGORIES,
    };
  }

  private makeEmptyRow(): GridFinding {
    return {
      _key: this.nextKey(),
      slNo: '', nameOfCustomers: '', findingDetails: '', category: '',
      lapsesOriginated: '', noOfInstances: '', findingArea: '',
      riskRating: 'Medium', complianceStatus: 'Unrectified', lapsesType: '',
      rowState: 'new', _catSearch: '', _catOpen: false, _filteredCats: CATEGORIES,
    };
  }

  private snapshot(): string {
    return JSON.stringify(this.rows.map(({ _filteredCats, ...r }) => r));
  }

  private restoreSnapshot(json: string): GridFinding[] {
    return (JSON.parse(json) as Omit<GridFinding, '_filteredCats'>[]).map(r => ({
      ...r, _filteredCats: CATEGORIES, _catOpen: false,
    } as GridFinding));
  }

  // ── Undo / Redo ───────────────────────────────────────────────────────────
  pushUndo() {
    this.undoStack.push(this.snapshot());
    if (this.undoStack.length > 20) this.undoStack.shift();
    this.redoStack = [];
  }

  undo() {
    if (!this.undoStack.length) { this.snack.open('Nothing to undo', '', { duration: 1200 }); return; }
    this.redoStack.push(this.snapshot());
    this.rows = this.restoreSnapshot(this.undoStack.pop()!);
    this.syncFormulaBar();
    this.cdr.detectChanges();
  }

  redo() {
    if (!this.redoStack.length) { this.snack.open('Nothing to redo', '', { duration: 1200 }); return; }
    this.undoStack.push(this.snapshot());
    this.rows = this.restoreSnapshot(this.redoStack.pop()!);
    this.syncFormulaBar();
    this.cdr.detectChanges();
  }

  // ── Active cell ───────────────────────────────────────────────────────────
  setActive(ri: number, ci: number, extend = false) {
    const rows = this.filteredRows;
    if (!rows.length) return;
    ri = Math.max(0, Math.min(ri, rows.length - 1));
    ci = Math.max(0, Math.min(ci, this.COLS.length - 1));
    if (!extend) { this.selStartRow = ri; this.selStartCol = ci; }
    this.selEndRow = ri; this.selEndCol = ci;
    this.activeRow = ri; this.activeCol = ci;
    this.syncFormulaBar();
  }

  navigate(ri: number, ci: number, extend = false) {
    this.setActive(ri, ci, extend);
    setTimeout(() => {
      document.querySelector<HTMLElement>(
        `tr[data-rowidx="${this.activeRow}"] [data-colidx="${this.activeCol}"]`
      )?.focus({ preventScroll: false });
    });
  }

  syncFormulaBar() {
    if (this.activeRow < 0 || this.activeCol < 0) { this.formulaBarValue = ''; return; }
    const row = this.filteredRows[this.activeRow];
    if (!row) { this.formulaBarValue = ''; return; }
    this.formulaBarValue = String((row as any)[this.COLS[this.activeCol].key] ?? '');
  }

  onFormulaBarChange() {
    if (this.activeRow < 0 || this.activeCol < 0) return;
    const row = this.filteredRows[this.activeRow];
    const col = this.COLS[this.activeCol];
    if (row && col) { (row as any)[col.key] = this.formulaBarValue; this.markDirty(row); }
  }

  onCellFocus(ri: number, ci: number) {
    this.setActive(ri, ci);
    this.preFocusSnap = this.snapshot();
  }

  onCellBlur() {
    if (this.preFocusSnap) {
      const cur = this.snapshot();
      if (cur !== this.preFocusSnap) {
        this.undoStack.push(this.preFocusSnap);
        if (this.undoStack.length > 20) this.undoStack.shift();
        this.redoStack = [];
      }
      this.preFocusSnap = null;
    }
    this.syncFormulaBar();
  }

  // ── Mouse selection ───────────────────────────────────────────────────────
  onCellMouseDown(e: MouseEvent, ri: number, ci: number) {
    if (e.button !== 0) return;
    this.setActive(ri, ci, e.shiftKey);
    const onMove = (me: MouseEvent) => {
      const tr = (me.target as HTMLElement)?.closest<HTMLElement>('tr[data-rowidx]');
      const td = (me.target as HTMLElement)?.closest<HTMLElement>('td[data-colidx]');
      if (tr && td) {
        const nr2 = Math.max(0, Math.min(parseInt(tr.getAttribute('data-rowidx') ?? String(ri)), this.filteredRows.length - 1));
        const nc2 = Math.max(0, Math.min(parseInt(td.getAttribute('data-colidx') ?? String(ci)), this.COLS.length - 1));
        if (nr2 !== this.selEndRow || nc2 !== this.selEndCol) {
          this.selEndRow = nr2; this.selEndCol = nc2;
          this.cdr.markForCheck();
        }
      }
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  isActive(ri: number, ci: number): boolean { return this.activeRow === ri && this.activeCol === ci; }

  isInSelection(ri: number, ci: number): boolean {
    if (this.selStartRow < 0) return false;
    const r1 = Math.min(this.selStartRow, this.selEndRow);
    const r2 = Math.max(this.selStartRow, this.selEndRow);
    const c1 = Math.min(this.selStartCol, this.selEndCol);
    const c2 = Math.max(this.selStartCol, this.selEndCol);
    return ri >= r1 && ri <= r2 && ci >= c1 && ci <= c2;
  }

  // ── Copy ──────────────────────────────────────────────────────────────────
  copySelection() {
    if (this.selStartRow < 0) return;
    const r1 = Math.min(this.selStartRow, this.selEndRow);
    const r2 = Math.max(this.selStartRow, this.selEndRow);
    const c1 = Math.min(this.selStartCol, this.selEndCol);
    const c2 = Math.max(this.selStartCol, this.selEndCol);
    const rows = this.filteredRows;
    const lines: string[] = [];
    for (let ri = r1; ri <= r2; ri++) {
      const cells: string[] = [];
      for (let ci = c1; ci <= c2; ci++) {
        cells.push(String((rows[ri] as any)[this.COLS[ci].key] ?? ''));
      }
      lines.push(cells.join('\t'));
    }
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
    this.snack.open(`Copied ${r2-r1+1}×${c2-c1+1} cells`, 'OK', { duration: 1500 });
  }

  // ── System-clipboard paste ────────────────────────────────────────────────
  private handleSystemPaste(e: ClipboardEvent) {
    const inGrid = !!document.activeElement?.closest('.grid-scroll');
    const inFBar = document.activeElement?.classList.contains('formula-bar-input');
    if (!inGrid && !inFBar) return;
    if ((e.target as HTMLElement).classList.contains('cat-search-input')) return;
    if ((e.target as HTMLElement).classList.contains('fp-search')) return;

    const text = e.clipboardData?.getData('text/plain') ?? '';
    if (!text.trim()) return;
    e.preventDefault();

    const parsedRows = text.trim().split('\n').map(l => l.split('\t'));
    this.pushUndo();

    if (this.activeRow >= 0) {
      const baseRow = this.activeRow;
      const baseCol = this.activeCol >= 0 ? Math.min(this.selStartCol, this.selEndCol) : 0;
      parsedRows.forEach((cells, ri) => {
        let targetRow = this.filteredRows[baseRow + ri];
        if (!targetRow) { targetRow = this.makeEmptyRow(); this.rows.push(targetRow); }
        cells.forEach((val, ci) => {
          const col = this.COLS[baseCol + ci];
          if (col) { (targetRow as any)[col.key] = val.trim(); this.markDirty(targetRow); }
        });
      });
      this.selEndRow = baseRow + parsedRows.length - 1;
      this.selEndCol = Math.min(baseCol + (parsedRows[0]?.length ?? 1) - 1, this.COLS.length - 1);
    } else {
      const keys: DataKey[] = ['slNo','nameOfCustomers','findingDetails','category',
        'lapsesOriginated','noOfInstances','findingArea','riskRating','complianceStatus','lapsesType'];
      parsedRows.forEach(cells => {
        const row = this.makeEmptyRow();
        cells.forEach((v, i) => { if (i < keys.length) (row as any)[keys[i]] = v.trim(); });
        this.rows.push(row);
      });
    }
    this.snack.open(`Pasted ${parsedRows.length} row(s)`, 'OK', { duration: 2000 });
    this.cdr.detectChanges();
  }

  // ── Clear selection cells ─────────────────────────────────────────────────
  clearSelection() {
    if (this.selStartRow < 0) return;
    this.pushUndo();
    const r1 = Math.min(this.selStartRow, this.selEndRow);
    const r2 = Math.max(this.selStartRow, this.selEndRow);
    const c1 = Math.min(this.selStartCol, this.selEndCol);
    const c2 = Math.max(this.selStartCol, this.selEndCol);
    const rows = this.filteredRows;
    for (let ri = r1; ri <= r2; ri++) {
      for (let ci = c1; ci <= c2; ci++) {
        const col = this.COLS[ci];
        if (rows[ri] && col.type !== 'select') {
          (rows[ri] as any)[col.key] = '';
          this.markDirty(rows[ri]);
        }
      }
    }
    this.syncFormulaBar();
  }

  // ── Row management ────────────────────────────────────────────────────────
  addRow() { this.rows.push(this.makeEmptyRow()); }

  insertRowAbove() {
    this.pushUndo();
    const newRow = this.makeEmptyRow();
    const visRow = this.activeRow >= 0 ? this.filteredRows[this.activeRow] : null;
    if (visRow) {
      this.rows.splice(this.rows.indexOf(visRow), 0, newRow);
    } else {
      this.rows.unshift(newRow);
    }
  }

  duplicateRow(row: GridFinding) {
    this.pushUndo();
    const clone: GridFinding = {
      ...row, _key: this.nextKey(), id: undefined,
      rowState: 'new', _catSearch: '', _catOpen: false, _filteredCats: CATEGORIES,
    };
    this.rows.splice(this.rows.indexOf(row) + 1, 0, clone);
  }

  removeRow(row: GridFinding) {
    this.pushUndo();
    if (row.id) { row.rowState = 'deleted'; }
    else { this.rows = this.rows.filter(r => r._key !== row._key); }
    this.selectedKeys.delete(row._key);
    if (this.activeRow >= this.filteredRows.length) this.activeRow = this.filteredRows.length - 1;
  }

  markDirty(row: GridFinding) {
    if (row.rowState === 'unchanged') row.rowState = 'modified';
  }

  // ── Fill down (Ctrl+D) ────────────────────────────────────────────────────
  fillDown() {
    if (this.activeRow < 0) return;
    const srcRow = this.filteredRows[this.activeRow];
    if (!srcRow) return;
    this.pushUndo();
    const r2 = this.selEndRow > this.selStartRow ? this.selEndRow : this.filteredRows.length - 1;
    const c1 = Math.min(this.selStartCol, this.selEndCol);
    const c2 = Math.max(this.selStartCol, this.selEndCol);
    for (let ri = this.activeRow + 1; ri <= r2; ri++) {
      const row = this.filteredRows[ri];
      if (!row) break;
      for (let ci = c1; ci <= c2; ci++) {
        const col = this.COLS[ci];
        (row as any)[col.key] = (srcRow as any)[col.key];
        this.markDirty(row);
      }
    }
  }

  // ── Fill handle (drag) ────────────────────────────────────────────────────
  startFill(e: MouseEvent, row: GridFinding, idx: number) {
    e.preventDefault(); e.stopPropagation();
    this.dragActive = true; this.dragSrcRow = row;
    this.dragSrcIdx = idx; this.dragCurIdx = idx;

    const onMove = (me: MouseEvent) => {
      const el = document.elementFromPoint(me.clientX, me.clientY)?.closest<HTMLElement>('[data-rowidx]');
      if (el) {
        const i = parseInt(el.getAttribute('data-rowidx') ?? String(idx));
        if (i !== this.dragCurIdx) { this.dragCurIdx = i; this.cdr.markForCheck(); }
      }
    };
    const onUp = () => {
      if (this.dragActive && this.dragSrcRow && this.dragCurIdx !== this.dragSrcIdx) {
        this.applyFill(this.dragSrcIdx, this.dragCurIdx, this.dragSrcRow);
      }
      this.dragActive = false; this.dragSrcRow = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      this.cdr.markForCheck();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  private applyFill(fromIdx: number, toIdx: number, src: GridFinding) {
    this.pushUndo();
    const start = Math.min(fromIdx, toIdx), end = Math.max(fromIdx, toIdx);
    const keys: DataKey[] = ['slNo','nameOfCustomers','findingDetails','category',
      'lapsesOriginated','noOfInstances','findingArea','riskRating','complianceStatus','lapsesType'];
    this.filteredRows.slice(start, end + 1).forEach(r => {
      if (r._key !== src._key) {
        keys.forEach(k => { (r as any)[k] = (src as any)[k]; });
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

  // ── Selection (checkbox) ──────────────────────────────────────────────────
  toggleSelect(key: string) {
    if (this.selectedKeys.has(key)) this.selectedKeys.delete(key);
    else this.selectedKeys.add(key);
  }

  toggleAll() {
    if (this.allSelected) this.selectedKeys.clear();
    else this.filteredRows.forEach(r => this.selectedKeys.add(r._key));
  }

  deleteSelected() {
    if (!this.selectedKeys.size) return;
    if (!confirm(`Delete ${this.selectedKeys.size} row(s)?`)) return;
    this.pushUndo();
    [...this.selectedKeys].forEach(k => {
      const r = this.rows.find(x => x._key === k);
      if (r) { if (r.id) r.rowState = 'deleted'; else this.rows = this.rows.filter(x => x._key !== k); }
    });
    this.selectedKeys.clear();
  }

  // ── Bulk edit ─────────────────────────────────────────────────────────────
  get bulkFieldDef(): ColDef | undefined { return this.COLS.find(c => c.key === this.bulkField); }

  applyBulkEdit() {
    if (!this.bulkField || !this.bulkValue) return;
    this.pushUndo();
    this.rows.forEach(r => {
      if (this.selectedKeys.has(r._key) && r.rowState !== 'deleted') {
        (r as any)[this.bulkField] = this.bulkValue;
        this.markDirty(r);
      }
    });
    this.bulkField = ''; this.bulkValue = '';
  }

  // ── Category dropdown ─────────────────────────────────────────────────────
  openCat(row: GridFinding, e: MouseEvent) {
    e.stopPropagation();
    const wasOpen = row._catOpen;
    this.rows.forEach(r => { r._catOpen = false; });
    if (!wasOpen) {
      row._catSearch = ''; row._filteredCats = CATEGORIES; row._catOpen = true;
      setTimeout(() => {
        document.querySelector<HTMLInputElement>(`.cat-search-input[data-rowkey="${row._key}"]`)?.focus();
      }, 30);
    }
  }

  filterCat(row: GridFinding) {
    const s = row._catSearch.toLowerCase();
    row._filteredCats = s ? CATEGORIES.filter(c => c.toLowerCase().includes(s)) : CATEGORIES;
  }

  selectCat(row: GridFinding, cat: string, e: MouseEvent) {
    e.stopPropagation();
    this.preFocusSnap = this.preFocusSnap ?? this.snapshot();
    row.category = cat; row._catOpen = false;
    this.markDirty(row); this.syncFormulaBar();
    const cur = this.snapshot();
    if (this.preFocusSnap && cur !== this.preFocusSnap) {
      this.undoStack.push(this.preFocusSnap);
      if (this.undoStack.length > 20) this.undoStack.shift();
      this.redoStack = [];
    }
    this.preFocusSnap = null;
  }

  // ── Column resize ─────────────────────────────────────────────────────────
  startResize(e: MouseEvent, ci: number) {
    e.preventDefault(); e.stopPropagation();
    this.resizingCol = ci;
    const startX = e.clientX, startW = this.COLS[ci].width;
    const onMove = (me: MouseEvent) => {
      this.COLS[this.resizingCol].width = Math.max(this.COLS[this.resizingCol].minWidth, startW + (me.clientX - startX));
      this.cdr.markForCheck();
    };
    const onUp = () => {
      this.resizingCol = -1;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // ── Column filters ────────────────────────────────────────────────────────
  getUniqueValues(key: DataKey): string[] {
    const vals = new Set<string>();
    this.visibleRows.forEach(r => {
      const v = String((r as any)[key] ?? '');
      vals.add(v);
    });
    // Merge predefined options for select columns
    const col = this.COLS.find(c => c.key === key);
    if (col?.options) col.options.forEach(o => vals.add(o));
    return [...vals].sort((a, b) => a.localeCompare(b));
  }

  openFilterPanel(ci: number, e: MouseEvent) {
    e.stopPropagation();
    const wasOpen = this.filterPanels[ci].open;
    // Close all dropdowns and panels
    this.filterPanels.forEach(p => { p.open = false; });
    this.rows.forEach(r => { r._catOpen = false; });
    if (!wasOpen) {
      const col   = this.COLS[ci];
      const panel = this.filterPanels[ci];
      panel.allValues = this.getUniqueValues(col.key);
      panel.searchTerm = '';
      panel.displayedValues = [...panel.allValues];
      // Load existing filter if any
      const existing = this.columnFilters.get(col.key);
      if (existing) {
        panel.mode           = existing.mode;
        panel.pendingChecked = new Set(existing.selectedValues);
        panel.pendingOperator = existing.operator;
        panel.pendingText    = existing.text;
      } else {
        panel.mode           = 'values';
        panel.pendingChecked = new Set(panel.allValues); // all checked = no filter
        panel.pendingOperator = 'contains';
        panel.pendingText    = '';
      }
      panel.open = true;
    }
  }

  filterPanelSearch(ci: number) {
    const panel = this.filterPanels[ci];
    const s = panel.searchTerm.toLowerCase();
    panel.displayedValues = s
      ? panel.allValues.filter(v => v.toLowerCase().includes(s))
      : [...panel.allValues];
  }

  togglePendingValue(ci: number, val: string) {
    const set = this.filterPanels[ci].pendingChecked;
    if (set.has(val)) set.delete(val); else set.add(val);
  }

  toggleAllPendingValues(ci: number, checked: boolean) {
    const panel = this.filterPanels[ci];
    if (checked) panel.displayedValues.forEach(v => panel.pendingChecked.add(v));
    else panel.displayedValues.forEach(v => panel.pendingChecked.delete(v));
  }

  isAllPendingChecked(ci: number): boolean {
    const panel = this.filterPanels[ci];
    return panel.displayedValues.length > 0 &&
      panel.displayedValues.every(v => panel.pendingChecked.has(v));
  }

  isSomePendingChecked(ci: number): boolean {
    const panel = this.filterPanels[ci];
    const some = panel.displayedValues.some(v => panel.pendingChecked.has(v));
    return some && !this.isAllPendingChecked(ci);
  }

  applyFilter(ci: number) {
    const col   = this.COLS[ci];
    const panel = this.filterPanels[ci];

    if (panel.mode === 'values') {
      const allChecked = panel.allValues.every(v => panel.pendingChecked.has(v));
      if (allChecked) {
        this.columnFilters.delete(col.key);
      } else {
        this.columnFilters.set(col.key, {
          mode: 'values',
          selectedValues: new Set(panel.pendingChecked),
          operator: 'equals',
          text: '',
        });
      }
    } else {
      if (!panel.pendingText.trim()) {
        this.columnFilters.delete(col.key);
      } else {
        this.columnFilters.set(col.key, {
          mode: 'text',
          selectedValues: new Set<string>(),
          operator: panel.pendingOperator,
          text: panel.pendingText,
        });
      }
    }
    panel.open = false;
    if (this.activeRow >= this.filteredRows.length) this.activeRow = this.filteredRows.length - 1;
  }

  clearFilter(ci: number) {
    this.columnFilters.delete(this.COLS[ci].key);
    this.filterPanels[ci].open = false;
  }

  clearAllFilters() {
    this.columnFilters.clear();
    this.filterPanels.forEach(p => { p.open = false; });
    this.snack.open('All filters cleared', 'OK', { duration: 1500 });
  }

  isFilterActive(ci: number): boolean {
    return this.columnFilters.has(this.COLS[ci].key);
  }

  // ── Row density ───────────────────────────────────────────────────────────
  setDensity(d: RowDensity) {
    this.rowDensity = d;
    localStorage.setItem(DENSITY_KEY, d);
  }

  cycleDensity() {
    const order: RowDensity[] = ['compact', 'comfortable', 'spacious'];
    const next = order[(order.indexOf(this.rowDensity) + 1) % order.length];
    this.setDensity(next);
  }

  // ── Cell value helpers ────────────────────────────────────────────────────
  cellVal(row: GridFinding, key: DataKey): string { return String((row as any)[key] ?? ''); }

  setCellVal(row: GridFinding, key: DataKey, val: string) {
    (row as any)[key] = val;
    this.markDirty(row);
    if (this.activeRow >= 0 && this.COLS[this.activeCol]?.key === key) this.formulaBarValue = val;
  }

  riskClass(v: string): string {
    return v === 'High' ? 'risk-high' : v === 'Medium' ? 'risk-med' : 'risk-low';
  }

  statusClass(v: string): string {
    return v === 'Rectified' ? 'st-rect' : v === 'Unrectified' ? 'st-unrect' : 'st-xfer';
  }

  // ── Global document click — close all panels ──────────────────────────────
  @HostListener('document:click')
  onDocumentClick() {
    if (this.rows.some(r => r._catOpen)) {
      this.rows.forEach(r => { r._catOpen = false; r._catSearch = ''; r._filteredCats = CATEGORIES; });
    }
    if (this.filterPanels.some(p => p.open)) {
      this.filterPanels.forEach(p => { p.open = false; });
    }
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const inGrid = !!target.closest('.grid-scroll');
    const inFBar = target.classList.contains('formula-bar-input');
    if (!inGrid && !inFBar) return;
    if (target.classList.contains('cat-search-input')) return;
    if (target.classList.contains('fp-search') || target.classList.contains('fp-text-input')) return;

    const { ctrlKey, shiftKey, key } = e;

    if (ctrlKey && key === 's')                         { e.preventDefault(); this.saveAll(); return; }
    if (ctrlKey && !shiftKey && key === 'z')            { e.preventDefault(); this.undo(); return; }
    if (ctrlKey && (key === 'y' || (shiftKey && key === 'Z'))) { e.preventDefault(); this.redo(); return; }
    if (ctrlKey && key === 'd')                         { e.preventDefault(); this.fillDown(); return; }
    if (ctrlKey && shiftKey && key === '+')             { e.preventDefault(); this.insertRowAbove(); return; }

    if (ctrlKey && key === 'c') {
      const hasTextSel = (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        (target as HTMLInputElement).selectionStart !== (target as HTMLInputElement).selectionEnd;
      if (!hasTextSel && this.selStartRow >= 0) { e.preventDefault(); this.copySelection(); }
      return;
    }

    if (this.activeRow < 0) return;

    switch (key) {
      case 'ArrowUp':    e.preventDefault(); this.navigate(this.activeRow - 1, this.activeCol, shiftKey); break;
      case 'ArrowDown':  e.preventDefault(); this.navigate(this.activeRow + 1, this.activeCol, shiftKey); break;
      case 'ArrowLeft':
        if (ctrlKey || target.tagName === 'SELECT') { e.preventDefault(); this.navigate(this.activeRow, this.activeCol - 1, shiftKey); }
        break;
      case 'ArrowRight':
        if (ctrlKey || target.tagName === 'SELECT') { e.preventDefault(); this.navigate(this.activeRow, this.activeCol + 1, shiftKey); }
        break;
      case 'Tab':
        e.preventDefault();
        shiftKey ? this.navigate(this.activeRow, this.activeCol - 1) : this.navigate(this.activeRow, this.activeCol + 1);
        break;
      case 'Enter':
        if (target.tagName !== 'TEXTAREA') { e.preventDefault(); this.navigate(this.activeRow + 1, this.activeCol); }
        break;
      case 'Delete':
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') { e.preventDefault(); this.clearSelection(); }
        break;
      case 'Escape':
        this.rows.forEach(r => { r._catOpen = false; });
        this.filterPanels.forEach(p => { p.open = false; });
        break;
    }
  }

  // ── Export CSV (filtered rows) ────────────────────────────────────────────
  exportCsv() {
    const headers = this.COLS.map(c => `"${c.label}"`).join(',');
    const lines = this.filteredRows.map(r =>
      this.COLS.map(c => `"${this.cellVal(r, c.key).replace(/"/g, '""')}"`).join(',')
    );
    const blob = new Blob(['﻿' + [headers, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `findings_report${this.data.reportId}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ── Save all ──────────────────────────────────────────────────────────────
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

    if (!ops.length) { this.snack.open('No changes to save', 'OK', { duration: 2000 }); return; }

    this.saving = true; this.saveProgress = 0; this.saveResults = null;
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
        } else { failed++; }
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
      complianceStatus: r.complianceStatus, lapsesType: r.lapsesType,
    };
  }

  private toUpdate(r: GridFinding): UpdateFindingRequest {
    return {
      slNo: r.slNo, nameOfCustomers: r.nameOfCustomers,
      findingDetails: r.findingDetails, category: r.category,
      lapsesOriginated: r.lapsesOriginated, noOfInstances: r.noOfInstances,
      findingArea: r.findingArea, riskRating: r.riskRating as RiskRating,
      complianceStatus: r.complianceStatus, lapsesType: r.lapsesType,
    };
  }
}
