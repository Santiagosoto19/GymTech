import { Schedule } from '../entities/Schedule';
import { GymClass } from '../entities/GymClass';
import { AppError } from '../errors/AppError';
import { IGymClassRepository } from '../repositories/IGymClassRepository';
import { IScheduleRepository } from '../repositories/IScheduleRepository';

export class ClassSchedulingService {
  constructor(
    private readonly gymClassRepository: IGymClassRepository,
    private readonly scheduleRepository: IScheduleRepository
  ) {}

  async listClasses(): Promise<GymClass[]> {
    return this.gymClassRepository.findAll();
  }

  async createClass(data: {
    name: string;
    description?: string;
    instructor: string;
    capacity: number;
  }): Promise<GymClass> {
    const gymClass = new GymClass(data);
    return this.gymClassRepository.create(gymClass);
  }

  async reserveClass(classId: string, userId: string): Promise<{ id: string; classId: string; userId: string; createdAt: Date }> {
    const gymClass = await this.gymClassRepository.findById(classId);
    if (!gymClass) {
      throw AppError.notFound('Class not found');
    }

    const reservationCount = await this.gymClassRepository.countReservations(classId);
    if (gymClass.isFull(reservationCount)) {
      throw AppError.conflict('Clase llena');
    }

    return this.gymClassRepository.createReservation(classId, userId);
  }

  async listSchedules(): Promise<Schedule[]> {
    return this.scheduleRepository.findAll();
  }

  async listMyReservations(userId: string): Promise<
    Array<{ id: string; classId: string; userId: string; createdAt: Date; className: string; instructor: string; capacity: number; enrolledCount: number }>
  > {
    const reservations = await this.gymClassRepository.findReservationsByUserId(userId);
    const result = [];
    for (const r of reservations) {
      const gymClass = await this.gymClassRepository.findById(r.classId);
      if (!gymClass) continue;
      const enrolledCount = await this.gymClassRepository.countReservations(r.classId);
      result.push({
        ...r,
        className: gymClass.name,
        instructor: gymClass.instructor,
        capacity: gymClass.capacity,
        enrolledCount,
      });
    }
    return result;
  }

  async createSchedule(data: {
    classId: string;
    startTime: Date;
    endTime: Date;
    room: string;
  }): Promise<Schedule> {
    const gymClass = await this.gymClassRepository.findById(data.classId);
    if (!gymClass) {
      throw AppError.notFound('Class not found');
    }

    const schedule = new Schedule(data);
    const existing = await this.scheduleRepository.findByRoom(schedule.room);

    const hasOverlap = existing.some((s) => schedule.overlaps(s));
    if (hasOverlap) {
      throw AppError.conflict('Schedule overlaps with an existing class in the same room');
    }

    return this.scheduleRepository.create(schedule);
  }
}
