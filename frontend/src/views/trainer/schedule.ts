import { api } from '../../lib/api';
import { Layout } from '../../components/Layout';

export function TrainerSchedule(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'space-y-4';
  content.innerHTML = `
    <div class="glass-card panel-card">
      <h2 class="font-semibold mb-4">Programar clase</h2>
      <form id="schedule-form" class="grid md:grid-cols-2 gap-3">
        <select id="class-select" class="input-field" required><option value="">Clase...</option></select>
        <input class="input-field" name="room" placeholder="Salón" required />
        <input class="input-field" name="startTime" type="datetime-local" required />
        <input class="input-field" name="endTime" type="datetime-local" required />
        <button class="btn-primary md:col-span-2">Agregar al calendario</button>
      </form>
    </div>
    <div id="schedule-list" class="space-y-3"></div>
  `;

  const classSelect = content.querySelector('#class-select') as HTMLSelectElement;

  Promise.all([api.activity.getClasses(), api.activity.getSchedules()]).then(([classes, schedules]) => {
    classes.forEach((c) => {
      const o = document.createElement('option');
      o.value = c.id;
      o.textContent = `${c.name} (cap: ${c.capacity})`;
      classSelect.appendChild(o);
    });
    const list = content.querySelector('#schedule-list')!;
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
            <p class="text-sm text-muted">${s.room} · ${new Date(s.startTime).toLocaleString()}</p>
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
  });

  content.querySelector('#schedule-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    await api.activity.createSchedule({
      classId: classSelect.value,
      room: fd.get('room'),
      startTime: fd.get('startTime'),
      endTime: fd.get('endTime'),
    });
    window.location.reload();
  });

  return Layout('Calendario', content, 'Clases programadas');
}
