export interface Assignment {
  id: number;
  userId: number;
  userFullName: string;
  branchId: number;
  branchName: string;
  branchCode: string;
  year: number;
}

export interface AssignBranchRequest {
  userId: number;
  branchId: number;
  year: number;
}
