import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthService } from '../../../domain/services/AuthService';
import {
  validateLogin,
  validateCreateUser,
  validateUpdateStatus,
} from '../middlewares/validateAuth';
import { createAuthenticateMiddleware, requireAdmin, requireStaff } from '../middlewares/authenticate';

export function createAuthRoutes(authService: AuthService): Router {
  const router = Router();
  const controller = new AuthController(authService);
  const authenticate = createAuthenticateMiddleware(authService);

  router.post('/login', validateLogin, controller.login);
  router.get('/me', authenticate, controller.getMe);
  router.patch('/me', authenticate, controller.updateMe);
  router.get('/users', authenticate, requireAdmin, controller.listUsers);
  router.get('/users/clients', authenticate, requireStaff, controller.listClients);
  router.get('/users/lookup/:documentNumber', authenticate, requireStaff, controller.lookupByDocument);
  router.post('/users', authenticate, requireAdmin, validateCreateUser, controller.createUser);
  router.patch('/users/:id', authenticate, requireAdmin, controller.updateUser);
  router.patch('/users/:id/status', authenticate, requireAdmin, validateUpdateStatus, controller.updateUserStatus);
  router.get('/users/:id/validate', controller.validateUser);

  return router;
}
