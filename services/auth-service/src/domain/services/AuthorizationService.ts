import { RoleName } from '../entities/Role';
import { AppError } from '../errors/AppError';

export interface AuthContext {
  userId: string;
  email: string;
  role: RoleName;
}

const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  admin: ['users:create', 'users:update', 'users:status', 'users:read'],
  receptionist: ['users:read', 'attendance:manage'],
  trainer: ['users:read'],
  client: [],
};

export class AuthorizationService {
  hasPermission(role: RoleName, permission: string): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
  }

  requirePermission(context: AuthContext, permission: string): void {
    if (!this.hasPermission(context.role, permission)) {
      throw AppError.forbidden('Insufficient permissions');
    }
  }

  requireAdmin(context: AuthContext): void {
    if (context.role !== 'admin') {
      throw AppError.forbidden('Admin access required');
    }
  }
}
