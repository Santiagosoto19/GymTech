import { GymClass } from '../entities/GymClass';

export interface IGymClassRepository {
  findAll(): Promise<GymClass[]>;
  findById(id: string): Promise<GymClass | null>;
  create(gymClass: GymClass): Promise<GymClass>;
  countReservations(classId: string): Promise<number>;
  createReservation(classId: string, userId: string): Promise<{ id: string; classId: string; userId: string; createdAt: Date }>;
  findReservationsByUserId(userId: string): Promise<Array<{ id: string; classId: string; userId: string; createdAt: Date }>>;
}
