import { api } from '../../lib/api';
import { Layout } from '../../components/Layout';
import { getUser } from '../../state/auth';

export function TrainerClasses(): HTMLElement {
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="glass-card panel-card mb-4">
      <h2 class="font-semibold mb-4">Crear clase</h2>
      <form id="class-form" class="grid md:grid-cols-2 gap-3">
        <input class="input-field" name="name" placeholder="Nombre" required />
        <input class="input-field" name="instructor" placeholder="Instructor" required />
        <input class="input-field" name="capacity" type="number" placeholder="Capacidad" required />
        <textarea class="input-field md:col-span-2" name="description" placeholder="Descripción"></textarea>
        <button class="btn-primary md:col-span-2">Crear clase</button>
      </form>
    </div>
    <div id="classes-list" class="space-y-2"></div>
  `;

  const user = getUser();

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
    const fd = new FormData(e.target as HTMLFormElement);
    await api.activity.createClass({
      name: fd.get('name'),
      instructor: fd.get('instructor') || `${user?.firstName} ${user?.lastName}`,
      capacity: fd.get('capacity'),
      description: fd.get('description'),
    });
    load();
    (e.target as HTMLFormElement).reset();
  });

  return Layout('Clases', content, 'Entrenador');
}
