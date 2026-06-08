import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../domain/errors/AppError';

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const role = req.headers['x-user-role'] as string | undefined;

  if (role !== 'admin') {
    next(AppError.forbidden('Admin access required'));
    return;
  }

  next();
}
