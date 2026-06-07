import { api, type Routine } from '../../lib/api';
import { ClientLayout } from '../../components/ClientLayout';

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

function renderRoutinePanel(routine: Routine): string {
  const exercises = routine.exercises?.length
    ? routine.exercises
    : routine.description
      ? [{ name: routine.description, sets: undefined, reps: undefined }]
      : [];

  return `
    <div class="glass-card panel-card client-routine-card">
      <div class="health-routine-card__header mb-4">
        <div>
          <h3 class="gradient-text font-bold text-lg">${routine.name}</h3>
          ${routine.description ? `<p class="text-sm text-muted mt-1">${routine.description}</p>` : ''}
        </div>
        <span class="pill-badge">${DIFFICULTY_LABELS[routine.difficultyLevel || 'beginner'] || 'Principiante'}</span>
      </div>
      <ul class="health-exercise-list">
        ${exercises.map((ex) => `
          <li class="health-exercise-item">
            <span class="health-exercise-item__name">${ex.name}</span>
            <span class="health-exercise-item__sets">
              ${ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ex.sets ? `${ex.sets} series` : '—'}
            </span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

export function ClientRoutine(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'client-page';
  content.innerHTML = `
    <div id="routine-content">
      <p class="text-muted text-sm">Cargando tu rutina...</p>
    </div>
  `;

  api.activity.getMyRoutine()
    .then((routine) => {
      const container = content.querySelector('#routine-content')!;
      if (!routine) {
        container.innerHTML = `
          <div class="glass-card panel-card text-center py-10">
            <h3 class="gradient-text font-bold text-lg mb-2">Sin rutina asignada</h3>
            <p class="text-sm text-muted">Tu entrenador aún no te ha asignado una rutina personalizada.</p>
          </div>
        `;
        return;
      }
      container.innerHTML = renderRoutinePanel(routine);
    })
    .catch(() => {
      content.querySelector('#routine-content')!.innerHTML =
        '<p class="text-muted text-sm">No se pudo cargar tu rutina.</p>';
    });

  return ClientLayout(content, {
    pageTitle: 'Mi rutina',
    pageSubtitle: 'Plan de entrenamiento asignado',
  });
}

export function renderRoutinePreview(routine: Routine | null): string {
  if (!routine) {
    return '<p class="text-sm text-muted">Tu entrenador aún no te ha asignado una rutina.</p>';
  }
  const count = routine.exercises?.length ?? 0;
  return `
    <div class="client-routine-preview">
      <strong>${routine.name}</strong>
      <p class="text-xs text-muted mt-1">${DIFFICULTY_LABELS[routine.difficultyLevel || 'beginner']} · ${count} ejercicio${count === 1 ? '' : 's'}</p>
      <a href="#/client/routine" class="text-xs text-accent font-semibold mt-2 inline-block">Ver rutina completa →</a>
    </div>
  `;
}
