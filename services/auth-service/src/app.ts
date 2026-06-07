import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { AuthService } from './domain/services/AuthService';
import { UserRepository } from './infrastructure/repositories/UserRepository';
import { createAuthRoutes } from './interfaces/http/routes/authRoutes';
import { errorHandler } from './interfaces/http/controllers/authController';
import { config } from './config';

export function createApp(): express.Application {
  const app = express();

  const userRepository = new UserRepository();
  const authService = new AuthService(
    userRepository,
    config.jwtSecret,
    config.jwtExpiresIn
  );

  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'UP', service: 'auth-service' });
  });

  app.use('/api/v1/auth', createAuthRoutes(authService));
  app.use(errorHandler);

  return app;
}
