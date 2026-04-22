export type UserRole = 'Operator' | 'ComplianceOfficer' | 'ComplianceHead';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  email: string;
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  isActive: boolean;
  newPassword?: string;
}
