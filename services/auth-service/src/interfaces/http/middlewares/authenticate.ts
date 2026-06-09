import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../../domain/services/AuthService';
import { AuthContext } from '../../../domain/services/AuthorizationService';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export function createAuthenticateMiddleware(authService: AuthService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { message: 'Authorization token required' },
      });
      return;
    }

    try {
      const token = header.slice(7);
      const payload = authService.verifyToken(token);
      req.auth = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid token';
      res.status(401).json({ success: false, error: { message } });
    }
  };
}

export function requireStaff(req: Request, res: Response, next: NextFunction): void {
  const staff = ['admin', 'receptionist', 'trainer'];
  if (!req.auth || !staff.includes(req.auth.role)) {
    res.status(403).json({ success: false, error: { message: 'Staff access required' } });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.auth || req.auth.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: { message: 'Admin access required' },
    });
    return;
  }
  next();
}
