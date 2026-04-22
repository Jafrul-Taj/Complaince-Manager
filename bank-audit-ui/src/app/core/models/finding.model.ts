export type RiskRating = 'Low' | 'Medium' | 'High' | 'Critical';
export type RectificationStatus = 'Pending' | 'InProgress' | 'Rectified';

export interface AuditFinding {
  id: number;
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
  branchId: number;
  findingArea: string;
  slNo: string;
  findingDetails: string;
  riskRating: RiskRating;
  noOfInstances: string;
  year: number;
}

export interface UpdateFindingRequest extends CreateFindingRequest {}

export interface RectifyFindingRequest {
  rectificationStatus: RectificationStatus;
  rectificationRemarks: string;
}
