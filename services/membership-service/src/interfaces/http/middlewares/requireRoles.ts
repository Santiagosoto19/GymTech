import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../domain/errors/AppError';

export function requireRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.headers['x-user-role'] as string | undefined;
    if (!role || !roles.includes(role)) {
      next(AppError.forbidden('Insufficient permissions'));
      return;
    }
    next();
  };
}
