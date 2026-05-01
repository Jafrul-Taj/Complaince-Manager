export type RiskRating = 'Low' | 'Medium' | 'High' | 'Critical';
export type RectificationStatus = 'Pending' | 'InProgress' | 'Rectified';

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
  findingDetails: string;
  riskRating: RiskRating;
  noOfInstances: string;
  rectificationStatus: RectificationStatus;
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
  findingDetails: string;
  riskRating: RiskRating;
  noOfInstances: string;
}

export interface UpdateFindingRequest {
  findingArea: string;
  slNo: string;
  findingDetails: string;
  riskRating: RiskRating;
  noOfInstances: string;
}

export interface RectifyFindingRequest {
  rectificationStatus: RectificationStatus;
  rectificationRemarks: string;
}
