import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FindingService } from '../../../core/services/finding.service';
import { AuditFinding } from '../../../core/models/finding.model';

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

@Component({
  selector: 'app-finding-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatSnackBarModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './finding-form.component.html',
  styleUrl: './finding-form.component.css'
})
export class FindingFormComponent implements OnInit {
  @ViewChild('categorySearchInput') categorySearchInput!: ElementRef<HTMLInputElement>;

  isEdit: boolean;
  saving = false;
  allCategories = CATEGORIES;
  filteredCategories = CATEGORIES;

  form = this.fb.group({
    slNo: ['', Validators.required],
    nameOfCustomers: [''],
    findingDetails: ['', Validators.required],
    lapsesOriginated: [''],
    noOfInstances: [''],
    findingArea: ['', Validators.required],
    category: ['', Validators.required],
    riskRating: ['Medium', Validators.required],
    complianceStatus: ['', Validators.required],
    lapsesType: [''],
    auditBaseDate: [null as Date | null]
  });

  constructor(
    private fb: FormBuilder,
    private findingSvc: FindingService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<FindingFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { finding?: AuditFinding; reportId?: number }
  ) {
    this.isEdit = !!data.finding;
  }

  ngOnInit() {
    if (this.isEdit) {
      const f = this.data.finding!;
      this.form.patchValue({
        slNo: f.slNo,
        nameOfCustomers: f.nameOfCustomers,
        findingDetails: f.findingDetails,
        lapsesOriginated: f.lapsesOriginated,
        noOfInstances: f.noOfInstances,
        findingArea: f.findingArea,
        category: f.category,
        riskRating: f.riskRating,
        complianceStatus: f.complianceStatus,
        lapsesType: f.lapsesType,
        auditBaseDate: f.auditBaseDate ? new Date(f.auditBaseDate) : null
      });
    }
  }

  filterCategories(event: Event) {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredCategories = this.allCategories.filter(c =>
      c.toLowerCase().includes(term)
    );
  }

  onCategoryPanelOpen(opened: boolean) {
    if (opened) {
      this.filteredCategories = this.allCategories;
      setTimeout(() => {
        if (this.categorySearchInput) {
          this.categorySearchInput.nativeElement.value = '';
          this.categorySearchInput.nativeElement.focus();
        }
      }, 50);
    }
  }

  get selectedCategory(): string {
    return this.form.get('category')?.value ?? '';
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    const auditBaseDateStr = v.auditBaseDate
      ? (v.auditBaseDate as Date).toISOString()
      : null;

    const obs = this.isEdit
      ? this.findingSvc.update(this.data.finding!.id, {
          findingArea: v.findingArea!,
          slNo: v.slNo!,
          nameOfCustomers: v.nameOfCustomers || '',
          findingDetails: v.findingDetails!,
          lapsesOriginated: v.lapsesOriginated || '',
          category: v.category!,
          riskRating: v.riskRating as any,
          complianceStatus: v.complianceStatus!,
          lapsesType: v.lapsesType || '',
          noOfInstances: v.noOfInstances || '',
          auditBaseDate: auditBaseDateStr
        })
      : this.findingSvc.create({
          complianceAuditReportId: this.data.reportId!,
          findingArea: v.findingArea!,
          slNo: v.slNo!,
          nameOfCustomers: v.nameOfCustomers || '',
          findingDetails: v.findingDetails!,
          lapsesOriginated: v.lapsesOriginated || '',
          category: v.category!,
          riskRating: v.riskRating as any,
          complianceStatus: v.complianceStatus!,
          lapsesType: v.lapsesType || '',
          noOfInstances: v.noOfInstances || '',
          auditBaseDate: auditBaseDateStr
        });

    obs.subscribe({
      next: () => { this.snack.open('Finding saved', 'OK', { duration: 3000 }); this.dialogRef.close(true); },
      error: (err) => {
        this.saving = false;
        this.snack.open(err.error?.message || 'Save failed', 'OK', { duration: 4000 });
      }
    });
  }
}
