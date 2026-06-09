import { Request, Response, NextFunction } from 'express';
import { ClassSchedulingService } from '../../../domain/services/ClassSchedulingService';
import { RoutineAssignmentService } from '../../../domain/services/RoutineAssignmentService';
import { IGymClassRepository } from '../../../domain/repositories/IGymClassRepository';
import { IAttendanceRepository } from '../../../domain/repositories/IAttendanceRepository';
import { AppError } from '../../../domain/errors/AppError';
import { TrainerClientRepository } from '../../../infrastructure/repositories/TrainerClientRepository';

export class ActivityController {
  private readonly trainerClientRepo = new TrainerClientRepository();

  constructor(
    private readonly classSchedulingService: ClassSchedulingService,
    private readonly routineAssignmentService: RoutineAssignmentService,
    private readonly gymClassRepository: IGymClassRepository,
    private readonly attendanceRepository: IAttendanceRepository
  ) {}

  listClasses = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const classes = await this.classSchedulingService.listClasses();
      const enriched = await Promise.all(
        classes.map(async (c) => ({
          ...c.toJSON(),
          enrolledCount: await this.gymClassRepository.countReservations(c.id!),
        }))
      );
      res.status(200).json({ success: true, data: enriched });
    } catch (error) {
      next(error);
    }
  };

  createClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description, instructor, capacity } = req.body;
      const gymClass = await this.classSchedulingService.createClass({
        name,
        description,
        instructor,
        capacity: Number(capacity),
      });
      res.status(201).json({ success: true, data: gymClass.toJSON() });
    } catch (error) {
      next(error);
    }
  };

  reserveClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.body;
      if (!userId) {
        throw AppError.badRequest('userId is required');
      }
      const reservation = await this.classSchedulingService.reserveClass(req.params.id, userId);
      res.status(201).json({ success: true, data: reservation });
    } catch (error) {
      next(error);
    }
  };

  listRoutines = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const routines = await this.routineAssignmentService.listRoutines();
      res.status(200).json({ success: true, data: routines.map((r) => r.toJSON()) });
    } catch (error) {
      next(error);
    }
  };

  createRoutine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description, exercises, difficultyLevel } = req.body;
      const parsedExercises = exercises?.length
        ? exercises
        : [{ name: description || name, sets: 3, reps: 10 }];
      const routine = await this.routineAssignmentService.createRoutine({
        name,
        description,
        exercises: parsedExercises,
        difficultyLevel,
        createdBy: req.headers['x-user-id'] as string,
      });
      res.status(201).json({ success: true, data: routine.toJSON() });
    } catch (error) {
      next(error);
    }
  };

  getMyRoutine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.headers['x-user-id'] as string) || req.params.userId;
      const routine = await this.routineAssignmentService.getAssignedRoutine(userId);
      res.status(200).json({ success: true, data: routine?.toJSON() ?? null });
    } catch (error) {
      next(error);
    }
  };

  assignClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clientId } = req.body;
      const trainerId = req.headers['x-user-id'] as string;
      if (!clientId || !trainerId) {
        throw AppError.badRequest('clientId is required');
      }
      const assignment = await this.trainerClientRepo.assign(trainerId, clientId);
      res.status(201).json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  };

  listAssignedClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const trainerId = req.headers['x-user-id'] as string;
      const clients = await this.trainerClientRepo.findByTrainerId(trainerId);
      res.status(200).json({ success: true, data: clients });
    } catch (error) {
      next(error);
    }
  };

  createSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { classId, startTime, endTime, room } = req.body;
      const schedule = await this.classSchedulingService.createSchedule({
        classId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        room,
      });
      res.status(201).json({ success: true, data: schedule.toJSON() });
    } catch (error) {
      next(error);
    }
  };

  assignRoutine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { routineId, userId } = req.body;
      if (!routineId || !userId) {
        throw AppError.badRequest('routineId and userId are required');
      }
      const assignment = await this.routineAssignmentService.assignRoutine(routineId, userId);
      res.status(201).json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  };

  listMyReservations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw AppError.badRequest('User context required');
      }
      const reservations = await this.classSchedulingService.listMyReservations(userId);
      res.status(200).json({ success: true, data: reservations });
    } catch (error) {
      next(error);
    }
  };

  listSchedules = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schedules = await this.classSchedulingService.listSchedules();
      res.status(200).json({ success: true, data: schedules.map((s) => s.toJSON()) });
    } catch (error) {
      next(error);
    }
  };

  recordAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
      if (!idempotencyKey) {
        throw AppError.badRequest('Idempotency-Key header is required');
      }

      const { userId, classId } = req.body;
      if (!userId || !classId) {
        throw AppError.badRequest('userId and classId are required');
      }

      const existing = await this.attendanceRepository.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        res.status(200).json({ success: true, data: existing, idempotent: true });
        return;
      }

      const gymClass = await this.gymClassRepository.findById(classId);
      if (!gymClass) {
        throw AppError.notFound('Class not found');
      }

      const record = await this.attendanceRepository.create(userId, classId, idempotencyKey);
      res.status(201).json({ success: true, data: record });
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

  if (err.message.includes('required') || err.message.includes('must be')) {
    res.status(400).json({ success: false, error: { message: err.message } });
    return;
  }

  console.error('[activity-service]', err);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' },
  });
}
