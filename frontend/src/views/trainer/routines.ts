import { api } from '../../lib/api';
import { Layout } from '../../components/Layout';

export function TrainerRoutines(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'space-y-6';
  content.innerHTML = `
    <div class="glass-card panel-card">
      <h2 class="font-semibold mb-4">Crear rutina</h2>
      <form id="routine-form" class="space-y-3">
        <input class="input-field" name="name" placeholder="Título de la rutina" required />
        <select class="input-field" name="difficultyLevel">
          <option value="beginner">Principiante</option>
          <option value="intermediate">Intermedio</option>
          <option value="advanced">Avanzado</option>
        </select>
        <textarea class="input-field h-24 resize-none" name="description" placeholder="Descripción y ejercicios..." required></textarea>
        <button class="btn-primary w-full">Crear rutina</button>
      </form>
      <p id="create-msg" class="text-sm mt-2 hidden"></p>
    </div>
    <div class="glass-card panel-card">
      <h2 class="font-semibold mb-4">Asignar rutina a cliente</h2>
      <form id="assign-form" class="grid grid-cols-2 gap-3">
        <select id="routine-select" class="input-field"><option value="">Rutina...</option></select>
        <select id="client-select" class="input-field"><option value="">Cliente...</option></select>
        <button class="btn-primary col-span-2">Asignar</button>
        <button type="button" id="assign-all-btn" class="btn-secondary col-span-2">Asignar a todos los clientes</button>
      </form>
      <p id="assign-msg" class="text-sm mt-2 hidden"></p>
    </div>
    <div id="routines-list" class="space-y-2"></div>
  `;

  const routineSelect = content.querySelector('#routine-select') as HTMLSelectElement;
  const clientSelect = content.querySelector('#client-select') as HTMLSelectElement;
  const list = content.querySelector('#routines-list')!;

  async function load(): Promise<void> {
    const [routines, { users }, assigned] = await Promise.all([
      api.activity.getRoutines(),
      api.auth.getClients(),
      api.activity.getAssignedClients(),
    ]);
    list.innerHTML = routines.map((r) =>
      `<div class="glass-card panel-card"><strong>${r.name}</strong> <span class="text-xs text-accent ml-2">${r.difficultyLevel}</span><p class="text-sm text-muted mt-1">${r.description || ''}</p></div>`
    ).join('');
    routineSelect.innerHTML = '<option value="">Rutina...</option>';
    routines.forEach((r) => {
      const o = document.createElement('option');
      o.value = r.id;
      o.textContent = r.name;
      routineSelect.appendChild(o);
    });
    clientSelect.innerHTML = '<option value="">Cliente...</option>';
    assigned.forEach((a) => {
      const u = users.find((x) => x.id === a.clientId);
      if (u) {
        const o = document.createElement('option');
        o.value = u.id;
        o.textContent = `${u.firstName} ${u.lastName}`;
        clientSelect.appendChild(o);
      }
    });
  }

  load();

  content.querySelector('#routine-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const msg = content.querySelector('#create-msg') as HTMLElement;
    try {
      await api.activity.createRoutine({
        name: fd.get('name'),
        description: fd.get('description'),
        difficultyLevel: fd.get('difficultyLevel'),
      });
      msg.textContent = 'Rutina creada';
      msg.className = 'text-sm mt-2 text-success';
      msg.classList.remove('hidden');
      load();
    } catch (err) {
      msg.textContent = (err as { message?: string }).message || 'Error';
      msg.className = 'text-sm mt-2 text-danger';
      msg.classList.remove('hidden');
    }
  });

  content.querySelector('#assign-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = content.querySelector('#assign-msg') as HTMLElement;
    try {
      await api.activity.assignRoutine(routineSelect.value, clientSelect.value);
      msg.textContent = 'Rutina asignada al cliente';
      msg.className = 'text-sm mt-2 text-success';
      msg.classList.remove('hidden');
    } catch (err) {
      msg.textContent = (err as { message?: string }).message || 'Error';
      msg.className = 'text-sm mt-2 text-danger';
      msg.classList.remove('hidden');
    }
  });

  content.querySelector('#assign-all-btn')!.addEventListener('click', async () => {
    const msg = content.querySelector('#assign-msg') as HTMLElement;
    const routineId = routineSelect.value;
    if (!routineId) {
      msg.textContent = 'Selecciona una rutina';
      msg.className = 'text-sm mt-2 text-danger';
      msg.classList.remove('hidden');
      return;
    }
    const assigned = await api.activity.getAssignedClients();
    const clientIds = assigned.map((a) => a.clientId);
    if (!clientIds.length) {
      msg.textContent = 'No hay clientes asignados';
      msg.className = 'text-sm mt-2 text-warning';
      msg.classList.remove('hidden');
      return;
    }
    try {
      await Promise.all(clientIds.map((id) => api.activity.assignRoutine(routineId, id)));
      msg.textContent = `Rutina asignada a ${clientIds.length} cliente(s)`;
      msg.className = 'text-sm mt-2 text-success';
      msg.classList.remove('hidden');
    } catch (err) {
      msg.textContent = (err as { message?: string }).message || 'Error';
      msg.className = 'text-sm mt-2 text-danger';
      msg.classList.remove('hidden');
    }
  });

  return Layout('Rutinas', content, 'Entrenador');
}
