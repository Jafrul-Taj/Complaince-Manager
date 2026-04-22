export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  fullName: string;
  userId: number;
  expiresAt: string;
}
