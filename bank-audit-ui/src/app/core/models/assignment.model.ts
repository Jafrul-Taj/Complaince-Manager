export interface Assignment {
  id: number;
  userId: number;
  userFullName: string;
  branchId: number;
  branchName: string;
  branchCode: string;
}

export interface AssignmentSummary {
  id: number;
  branchId: number;
  branchName: string;
  branchCode: string;
  totalReports: number;
}

export interface AssignBranchRequest {
  userId: number;
  branchId: number;
}
