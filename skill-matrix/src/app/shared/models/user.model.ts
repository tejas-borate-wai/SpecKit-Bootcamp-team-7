export type UserRole = 'Employee' | 'Manager' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  avatarUrl: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
