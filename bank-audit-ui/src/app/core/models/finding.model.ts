export type RiskRating = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AuditFinding {
  id: number;
  complianceAuditReportId?: number;
  branchId: number;
  branchName: string;
  branchCode: string;
  assignedOfficerId: number;
  officerName: string;
  findingArea: string;
  slNo: string;
  nameOfCustomers: string;
  findingDetails: string;
  lapsesOriginated: string;
  category: string;
  riskRating: RiskRating;
  complianceStatus: string;
  lapsesType: string;
  noOfInstances: string;
  auditBaseDate?: string;
  rectificationRemarks?: string;
  rectifiedAt?: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFindingRequest {
  complianceAuditReportId: number;
  findingArea: string;
  slNo: string;
  nameOfCustomers: string;
  findingDetails: string;
  lapsesOriginated: string;
  category: string;
  riskRating: RiskRating;
  complianceStatus: string;
  lapsesType: string;
  noOfInstances: string;
  auditBaseDate?: string | null;
}

export interface UpdateFindingRequest {
  findingArea: string;
  slNo: string;
  nameOfCustomers: string;
  findingDetails: string;
  lapsesOriginated: string;
  category: string;
  riskRating: RiskRating;
  complianceStatus: string;
  lapsesType: string;
  noOfInstances: string;
  auditBaseDate?: string | null;
}

export interface RectifyFindingRequest {
  complianceStatus: string;
  rectificationRemarks: string;
}
