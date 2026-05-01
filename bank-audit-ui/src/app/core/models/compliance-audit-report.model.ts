export interface ComplianceAuditReport {
  id: number;
  userId: number;
  officerName: string;
  branchId: number;
  branchName: string;
  branchCode: string;
  year: number;
  auditTeamLeadId: string;
  auditTeamLeadName: string;
  auditTeamLeadDesignation: string;
  totalFindings: number;
  pendingFindings: number;
  rectifiedFindings: number;
  createdAt: string;
}

export interface CreateComplianceAuditReportRequest {
  branchId: number;
  year: number;
  auditTeamLeadId: string;
}
