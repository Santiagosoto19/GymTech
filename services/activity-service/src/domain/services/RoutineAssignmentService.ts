import { Routine } from '../entities/Routine';
import { AppError } from '../errors/AppError';
import { IRoutineRepository, RoutineAssignment } from '../repositories/IRoutineRepository';

export class RoutineAssignmentService {
  constructor(private readonly routineRepository: IRoutineRepository) {}

  async listRoutines(): Promise<Routine[]> {
    return this.routineRepository.findAll();
  }

  async createRoutine(data: {
    name: string;
    description?: string;
    exercises: Routine['exercises'];
    difficultyLevel?: Routine['difficultyLevel'];
    createdBy?: string;
  }): Promise<Routine> {
    const routine = new Routine(data);
    return this.routineRepository.create(routine);
  }

  async getAssignedRoutine(userId: string): Promise<Routine | null> {
    return this.routineRepository.findAssignedByUserId(userId);
  }

  async assignRoutine(routineId: string, userId: string): Promise<RoutineAssignment> {
    const routine = await this.routineRepository.findById(routineId);
    if (!routine) {
      throw AppError.notFound('Routine not found');
    }

    return this.routineRepository.assign(routineId, userId);
  }
}
