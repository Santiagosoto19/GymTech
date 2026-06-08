import { api, combineDateAndTime } from '../../lib/api';
import { Layout } from '../../components/Layout';
import { getUser } from '../../state/auth';

export function TrainerClasses(): HTMLElement {
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="glass-card panel-card mb-4">
      <h2 class="font-semibold mb-4">Crear clase</h2>
      <form id="class-form" class="grid md:grid-cols-2 gap-3" novalidate>
        <input class="input-field" name="name" placeholder="Nombre" required />
        <input class="input-field" name="instructor" placeholder="Instructor" required />
        <input class="input-field" name="capacity" type="number" placeholder="Capacidad" required />
        <input class="input-field" name="room" placeholder="Salón" required />
        <div class="client-form-field">
          <label for="class-date">Fecha</label>
          <input id="class-date" class="input-field" name="date" type="date" required />
        </div>
        <div class="client-form-field">
          <label for="class-start">Hora inicio</label>
          <input id="class-start" class="input-field" name="startTime" type="time" required />
        </div>
        <div class="client-form-field">
          <label for="class-end">Hora fin</label>
          <input id="class-end" class="input-field" name="endTime" type="time" required />
        </div>
        <textarea class="input-field md:col-span-2" name="description" placeholder="Descripción"></textarea>
        <p id="class-error" class="text-danger text-sm md:col-span-2 hidden"></p>
        <button class="btn-primary md:col-span-2">Crear clase</button>
      </form>
    </div>
    <div id="classes-list" class="space-y-2"></div>
  `;

  const user = getUser();
  const errorEl = content.querySelector('#class-error') as HTMLElement;

  async function load(): Promise<void> {
    const classes = await api.activity.getClasses();
    const list = content.querySelector('#classes-list')!;
    list.innerHTML = classes.map((c) => {
      const enrolled = c.enrolledCount ?? 0;
      return `<div class="glass-card panel-card"><strong>${c.name}</strong> · ${enrolled}/${c.capacity} cupos · ${c.instructor || ''}</div>`;
    }).join('') || '<p class="text-muted">Sin clases</p>';
  }

  load();

  content.querySelector('#class-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');
    const fd = new FormData(e.target as HTMLFormElement);
    const date = String(fd.get('date') || '');
    const start = String(fd.get('startTime') || '');
    const end = String(fd.get('endTime') || '');

    if (!date || !start || !end) {
      errorEl.textContent = 'Completa fecha, hora de inicio y hora de fin';
      errorEl.classList.remove('hidden');
      return;
    }

    const startISO = combineDateAndTime(date, start);
    const endISO = combineDateAndTime(date, end);
    if (new Date(endISO) <= new Date(startISO)) {
      errorEl.textContent = 'La hora de fin debe ser posterior a la de inicio';
      errorEl.classList.remove('hidden');
      return;
    }

    try {
      await api.activity.createClass({
        name: fd.get('name'),
        instructor: fd.get('instructor') || `${user?.firstName} ${user?.lastName}`,
        capacity: fd.get('capacity'),
        description: fd.get('description'),
        room: fd.get('room'),
        startTime: startISO,
        endTime: endISO,
      });
      load();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      errorEl.textContent = (err as { message?: string }).message || 'Error al crear clase';
      errorEl.classList.remove('hidden');
    }
  });

  return Layout('Clases', content, 'Entrenador');
}
