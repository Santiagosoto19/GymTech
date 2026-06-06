import { Request, Response, NextFunction } from 'express';
import { ROLES, RoleName } from '../../../domain/entities/Role';

export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      error: { message: 'Email and password are required' },
    });
    return;
  }

  next();
}

export function validateCreateUser(req: Request, res: Response, next: NextFunction): void {
  const { email, password, documentNumber, role } = req.body;

  if (!email || !password || !documentNumber || !role) {
    res.status(400).json({
      success: false,
      error: { message: 'email, password, documentNumber, and role are required' },
    });
    return;
  }

  if (!ROLES.includes(role as RoleName)) {
    res.status(400).json({
      success: false,
      error: { message: `role must be one of: ${ROLES.join(', ')}` },
    });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({
      success: false,
      error: { message: 'Password must be at least 6 characters' },
    });
    return;
  }

  next();
}

export function validateUpdateStatus(req: Request, res: Response, next: NextFunction): void {
  const { status } = req.body;

  if (!status || !['active', 'inactive'].includes(status)) {
    res.status(400).json({
      success: false,
      error: { message: 'status must be active or inactive' },
    });
    return;
  }

  next();
}
