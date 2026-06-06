import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { MembershipController, errorHandler } from './interfaces/http/controllers/membershipController';
import { createMembershipRoutes } from './interfaces/http/routes/membershipRoutes';

export function createApp(): { app: express.Application; controller: MembershipController } {
  const app = express();
  const controller = new MembershipController();

  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'UP', service: 'membership-service' });
  });

  app.use('/api/v1/membership', createMembershipRoutes(controller));
  app.use(errorHandler);

  return { app, controller };
}
