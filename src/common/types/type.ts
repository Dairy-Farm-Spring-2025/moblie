
export interface LoginResponse {
  code: number;
  message: string;
  timestamp: number;
  data?: UserData;
}

export interface UserData {
  accessToken: string;
  refreshToken: string;
  userId: number;
  fullName: string;
  roleName: string;
}
