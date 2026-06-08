import { api, combineDateAndTime } from '../../lib/api';
import { Layout } from '../../components/Layout';

export function TrainerSchedule(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'space-y-4';
  content.innerHTML = `
    <div class="glass-card panel-card">
      <h2 class="font-semibold mb-4">Programar clase</h2>
      <form id="schedule-form" class="grid md:grid-cols-2 gap-3" novalidate>
        <div class="md:col-span-2 client-form-field">
          <label for="class-select">Clase</label>
          <select id="class-select" class="input-field" required><option value="">Clase...</option></select>
        </div>
        <div class="client-form-field">
          <label for="schedule-date">Fecha</label>
          <input id="schedule-date" class="input-field" name="date" type="date" required />
        </div>
        <div class="client-form-field">
          <label for="schedule-room">Salón</label>
          <input id="schedule-room" class="input-field" name="room" placeholder="Salón" required />
        </div>
        <div class="client-form-field">
          <label for="schedule-start">Hora inicio</label>
          <input id="schedule-start" class="input-field" name="startTime" type="time" required />
        </div>
        <div class="client-form-field">
          <label for="schedule-end">Hora fin</label>
          <input id="schedule-end" class="input-field" name="endTime" type="time" required />
        </div>
        <p id="schedule-error" class="text-danger text-sm md:col-span-2 hidden"></p>
        <button class="btn-primary md:col-span-2">Agregar al calendario</button>
      </form>
    </div>
    <div id="schedule-list" class="space-y-3"></div>
  `;

  const classSelect = content.querySelector('#class-select') as HTMLSelectElement;
  const errorEl = content.querySelector('#schedule-error') as HTMLElement;

  async function loadSchedules(): Promise<void> {
    const [classes, schedules] = await Promise.all([
      api.activity.getClasses(),
      api.activity.getSchedules(),
    ]);

    classSelect.innerHTML = '<option value="">Clase...</option>';
    classes.forEach((c) => {
      const o = document.createElement('option');
      o.value = c.id;
      o.textContent = `${c.name} (cap: ${c.capacity})`;
      classSelect.appendChild(o);
    });

    const list = content.querySelector('#schedule-list')!;
    list.innerHTML = '';
    schedules.forEach((s) => {
      const cls = classes.find((c) => c.id === s.classId);
      const enrolled = cls?.enrolledCount ?? 0;
      const cap = cls?.capacity ?? 0;
      const pct = cap ? Math.round((enrolled / cap) * 100) : 0;
      const el = document.createElement('div');
      el.className = 'glass-card panel-card';
      el.innerHTML = `
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold">${cls?.name || 'Clase'}</h3>
            <p class="text-sm text-muted">${s.room} · ${new Date(s.startTime).toLocaleString('es')}</p>
          </div>
          <div class="text-right">
            <span class="text-lg font-bold">${enrolled}/${cap}</span>
            <div class="w-24 h-1.5 bg-slate-200 rounded-full mt-1"><div class="h-full bg-accent rounded-full" style="width:${pct}%"></div></div>
          </div>
        </div>
      `;
      list.appendChild(el);
    });
    if (!schedules.length) list.innerHTML = '<p class="text-muted">Sin horarios programados</p>';
  }

  loadSchedules();

  content.querySelector('#schedule-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');
    const fd = new FormData(e.target as HTMLFormElement);
    const date = String(fd.get('date') || '');
    const start = String(fd.get('startTime') || '');
    const end = String(fd.get('endTime') || '');

    if (!classSelect.value) {
      errorEl.textContent = 'Selecciona una clase';
      errorEl.classList.remove('hidden');
      return;
    }
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
      await api.activity.createSchedule({
        classId: classSelect.value,
        room: fd.get('room'),
        startTime: startISO,
        endTime: endISO,
      });
      loadSchedules();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      errorEl.textContent = (err as { message?: string }).message || 'Error al programar';
      errorEl.classList.remove('hidden');
    }
  });

  return Layout('Calendario', content, 'Entrenador');
}
