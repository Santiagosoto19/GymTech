import { api } from '../../lib/api';
import { Layout } from '../../components/Layout';

export function TrainerClients(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'space-y-4';
  content.innerHTML = `
    <div class="glass-card panel-card">
      <h2 class="font-semibold mb-4">Asignar cliente</h2>
      <form id="assign-form" class="flex gap-2">
        <select id="client-select" class="input-field flex-1"><option value="">Seleccionar cliente...</option></select>
        <button class="btn-primary">Asignar</button>
      </form>
    </div>
    <div id="clients-list" class="space-y-2"></div>
  `;

  const select = content.querySelector('#client-select') as HTMLSelectElement;
  const list = content.querySelector('#clients-list')!;

  async function load(): Promise<void> {
    const [{ users }, assigned] = await Promise.all([
      api.auth.getClients(),
      api.activity.getAssignedClients(),
    ]);
    users.forEach((u) => {
      if (!select.querySelector(`option[value="${u.id}"]`)) {
        const o = document.createElement('option');
        o.value = u.id;
        o.textContent = `${u.firstName} ${u.lastName} (${u.documentNumber})`;
        select.appendChild(o);
      }
    });
    list.innerHTML = '';
    for (const a of assigned) {
      const user = users.find((u) => u.id === a.clientId);
      const el = document.createElement('div');
      el.className = 'glass-card panel-card flex justify-between items-center';
      el.innerHTML = `
        <div>
          <strong>${user?.firstName || ''} ${user?.lastName || ''}</strong>
          <p class="text-sm text-muted">${user?.documentNumber || a.clientId}</p>
        </div>
        <a href="#/trainer/routines" class="text-xs text-accent">Asignar rutina →</a>
      `;
      list.appendChild(el);
    }
    if (!assigned.length) list.innerHTML = '<p class="text-muted">No hay clientes asignados</p>';
  }

  load();
  content.querySelector('#assign-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    await api.activity.assignClient(select.value);
    load();
  });

  return Layout('Clientes Asignados', content, 'Panel del Entrenador');
}
