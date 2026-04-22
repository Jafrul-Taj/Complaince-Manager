export interface Branch {
  id: number;
  branchName: string;
  branchCode: string;
  isActive: boolean;
}

export interface CreateBranchRequest {
  branchName: string;
  branchCode: string;
}

export interface UpdateBranchRequest {
  branchName: string;
  isActive: boolean;
}
