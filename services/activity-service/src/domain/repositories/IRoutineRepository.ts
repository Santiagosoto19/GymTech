import { Routine } from '../entities/Routine';

export interface RoutineAssignment {
  id: string;
  routineId: string;
  userId: string;
  assignedAt: Date;
}

export interface IRoutineRepository {
  findAll(): Promise<Routine[]>;
  findById(id: string): Promise<Routine | null>;
  create(routine: Routine): Promise<Routine>;
  assign(routineId: string, userId: string): Promise<RoutineAssignment>;
  findAssignedByUserId(userId: string): Promise<Routine | null>;
}
