import { api } from '../../lib/api';
import { Layout } from '../../components/Layout';

export function ReceptionMemberships(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'max-w-lg space-y-4';
  content.innerHTML = `
    <div class="glass-card panel-card">
      <h2 class="font-semibold mb-4">Asignar plan a cliente</h2>
      <form id="sub-form" class="space-y-3">
        <select class="input-field" id="user-select" required><option value="">Cliente...</option></select>
        <select class="input-field" id="plan-select" required><option value="">Plan...</option></select>
        <button class="btn-primary w-full">Asignar membresía</button>
      </form>
      <p id="msg" class="text-sm mt-2 hidden"></p>
    </div>
    <div class="glass-card panel-card">
      <h2 class="font-semibold mb-4">Cambiar estado</h2>
      <form id="status-form" class="space-y-3">
        <input class="input-field" id="sub-id" placeholder="ID de suscripción" required />
        <select class="input-field" id="sub-status">
          <option value="active">Activo</option>
          <option value="suspended">Congelado</option>
          <option value="canceled">Cancelado</option>
        </select>
        <button class="btn-primary w-full">Actualizar estado</button>
      </form>
    </div>
  `;

  const userSelect = content.querySelector('#user-select') as HTMLSelectElement;
  const planSelect = content.querySelector('#plan-select') as HTMLSelectElement;

  Promise.all([api.auth.getClients(), api.membership.getPlans()]).then(([{ users }, plans]) => {
    users.forEach((u) => {
      const o = document.createElement('option');
      o.value = u.id;
      o.textContent = `${u.firstName} ${u.lastName} (${u.documentNumber})`;
      userSelect.appendChild(o);
    });
    plans.forEach((p) => {
      const o = document.createElement('option');
      o.value = p.id;
      o.textContent = `${p.name} — $${p.price}`;
      planSelect.appendChild(o);
    });
  });

  content.querySelector('#sub-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = content.querySelector('#msg') as HTMLElement;
    try {
      await api.membership.createSubscription(userSelect.value, planSelect.value);
      msg.textContent = 'Membresía asignada correctamente';
      msg.className = 'text-sm mt-2 text-success';
      msg.classList.remove('hidden');
    } catch (err) {
      msg.textContent = (err as { message?: string }).message || 'Error';
      msg.className = 'text-sm mt-2 text-danger';
      msg.classList.remove('hidden');
    }
  });

  content.querySelector('#status-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = (content.querySelector('#sub-id') as HTMLInputElement).value;
    const status = (content.querySelector('#sub-status') as HTMLSelectElement).value;
    await api.membership.updateSubscriptionStatus(id, status);
    alert('Estado actualizado');
  });

  return Layout('Membresías', content, 'Recepción');
}
