export type RoleName = 'admin' | 'receptionist' | 'trainer' | 'client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: RoleName;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  documentNumber: string;
  role: RoleName;
  status: 'active' | 'inactive';
}
