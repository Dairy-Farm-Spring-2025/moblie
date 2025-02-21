export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  phoneNumber: string | null;
  employeeNumber: string;
  email: string;
  gender: string | null;
  address: string | null;
  profilePhoto: string;
  dob: string | null;
  status: string;
  roleId: Role;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse {
  code: number;
  message: string;
  timestamp: number;
  data: User;
}
