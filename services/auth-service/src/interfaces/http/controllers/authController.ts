import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../../domain/services/AuthService';
import { AppError } from '../../../domain/errors/AppError';
import { RoleName } from '../../../domain/entities/Role';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, documentNumber, role, firstName, lastName } = req.body;
      const user = await this.authService.createUser({
        email,
        password,
        documentNumber,
        role: role as RoleName,
        firstName,
        lastName,
      });
      res.status(201).json({ success: true, data: user.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, firstName, lastName, role, password } = req.body;
      const user = await this.authService.updateUser(req.params.id, {
        email,
        firstName,
        lastName,
        role,
        password,
      });
      res.status(200).json({ success: true, data: user.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  };

  updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.body;
      const user = await this.authService.updateUserStatus(req.params.id, status);
      res.status(200).json({ success: true, data: user.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  };

  updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      const { firstName, lastName, password } = req.body;
      const user = await this.authService.updateUser(userId, { firstName, lastName, password });
      res.status(200).json({ success: true, data: user.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      const user = await this.authService.getUserById(userId);
      res.status(200).json({ success: true, data: user.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  };

  listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.authService.listUsers();
      res.status(200).json({ success: true, data: { users: users.map((u) => u.toPublicJSON()) } });
    } catch (error) {
      next(error);
    }
  };

  listClients = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.authService.listUsers();
      const clients = users.filter((u) => u.getRoleName() === 'client').map((u) => u.toPublicJSON());
      res.status(200).json({ success: true, data: { users: clients } });
    } catch (error) {
      next(error);
    }
  };

  lookupByDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.lookupByDocument(req.params.documentNumber);
      res.status(200).json({ success: true, data: user.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  };

  validateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.validateUser(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code },
    });
    return;
  }

  if (err.message.includes('Invalid') || err.message.includes('must be')) {
    res.status(400).json({ success: false, error: { message: err.message } });
    return;
  }

  console.error('[auth-service]', err);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' },
  });
}
