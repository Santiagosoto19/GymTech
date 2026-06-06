import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ClassSchedulingService } from './domain/services/ClassSchedulingService';
import { RoutineAssignmentService } from './domain/services/RoutineAssignmentService';
import { GymClassRepository } from './infrastructure/repositories/GymClassRepository';
import { RoutineRepository } from './infrastructure/repositories/RoutineRepository';
import { ScheduleRepository } from './infrastructure/repositories/ScheduleRepository';
import { AttendanceRepository } from './infrastructure/repositories/AttendanceRepository';
import { ActivityController, errorHandler } from './interfaces/http/controllers/activityController';
import { createActivityRoutes } from './interfaces/http/routes/activityRoutes';

export function createApp(): express.Application {
  const app = express();

  const gymClassRepository = new GymClassRepository();
  const routineRepository = new RoutineRepository();
  const scheduleRepository = new ScheduleRepository();
  const attendanceRepository = new AttendanceRepository();

  const classSchedulingService = new ClassSchedulingService(
    gymClassRepository,
    scheduleRepository
  );
  const routineAssignmentService = new RoutineAssignmentService(routineRepository);

  const controller = new ActivityController(
    classSchedulingService,
    routineAssignmentService,
    gymClassRepository,
    attendanceRepository
  );

  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'UP', service: 'activity-service' });
  });

  app.use('/api/v1/activity', createActivityRoutes(controller));
  app.use(errorHandler);

  return app;
}
