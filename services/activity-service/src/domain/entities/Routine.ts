export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface RoutineProps {
  id?: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  difficultyLevel?: DifficultyLevel;
  createdBy?: string;
  createdAt?: Date;
}

export class Routine {
  readonly id?: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  difficultyLevel: DifficultyLevel;
  readonly createdBy?: string;
  readonly createdAt?: Date;

  constructor(props: RoutineProps) {
    if (!props.name?.trim()) {
      throw new Error('Routine name is required');
    }
    if (!props.exercises?.length) {
      throw new Error('Routine must have at least one exercise');
    }

    this.id = props.id;
    this.name = props.name.trim();
    this.description = props.description;
    this.exercises = props.exercises;
    this.difficultyLevel = props.difficultyLevel ?? 'beginner';
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      title: this.name,
      description: this.description ?? null,
      exercises: this.exercises,
      difficultyLevel: this.difficultyLevel,
      createdBy: this.createdBy ?? null,
      createdAt: this.createdAt,
    };
  }
}
