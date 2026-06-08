import { api } from '../../lib/api';
import { Layout } from '../../components/Layout';

export function AdminMemberships(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'space-y-6';
  content.innerHTML = `
    <div class="glass-card panel-card">
      <h2 class="font-semibold mb-4">Crear plan</h2>
      <form id="plan-form" class="grid md:grid-cols-2 gap-3">
        <input class="input-field" name="name" placeholder="Nombre del plan" required />
        <input class="input-field" name="price" type="number" step="0.01" placeholder="Precio" required />
        <input class="input-field" name="durationDays" type="number" placeholder="Duración (días)" required />
        <input class="input-field" name="maxOccupancy" type="number" placeholder="Aforo máximo" />
        <input class="input-field" name="monthlyEntryLimit" type="number" placeholder="Límite entradas/mes (vacío = ilimitado)" />
        <textarea class="input-field md:col-span-2" name="description" placeholder="Descripción"></textarea>
        <button class="btn-primary md:col-span-2">Crear plan</button>
      </form>
    </div>
    <div class="glass-card panel-card">
      <h2 class="font-semibold mb-4">Asignar suscripción</h2>
      <form id="sub-form" class="grid md:grid-cols-3 gap-3">
        <select class="input-field" id="user-select" required><option value="">Seleccionar cliente...</option></select>
        <select class="input-field" id="plan-select" required><option value="">Seleccionar plan...</option></select>
        <button class="btn-primary">Asignar plan</button>
      </form>
      <p id="sub-msg" class="text-sm mt-2 hidden"></p>
    </div>
    <div id="plans-list" class="space-y-2"></div>
    <div id="subs-list" class="space-y-2"></div>
  `;

  const userSelect = content.querySelector('#user-select') as HTMLSelectElement;
  const planSelect = content.querySelector('#plan-select') as HTMLSelectElement;

  Promise.all([api.auth.getClients(), api.membership.getPlans()]).then(([{ users }, plans]) => {
    users.forEach((u) => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.textContent = `${u.firstName || ''} ${u.lastName || ''} (${u.documentNumber})`;
      userSelect.appendChild(opt);
    });
    plans.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} — $${p.price}`;
      planSelect.appendChild(opt);
      const el = document.createElement('div');
      el.className = 'glass-card panel-card';
      const limit = p.monthlyEntryLimit != null ? `${p.monthlyEntryLimit} entradas/mes` : 'Ilimitado';
      el.innerHTML = `<strong>${p.name}</strong> · $${p.price} · ${p.durationDays} días · ${limit}`;
      content.querySelector('#plans-list')!.appendChild(el);
    });
  });

  api.membership.getSubscriptions().then((subs) => {
    const container = content.querySelector('#subs-list')!;
    subs.forEach((s) => {
      const el = document.createElement('div');
      el.className = 'glass-card panel-card flex justify-between items-center';
      el.innerHTML = `
        <span>Usuario: ${s.userId.slice(0, 8)}... · <span class="status-badge ${s.status === 'active' ? 'active' : 'expired'}">${s.status}</span></span>
        <div class="flex gap-2">
          <button data-id="${s.id}" data-status="suspended" class="text-xs px-2 py-1 bg-slate-100 rounded">Congelar</button>
          <button data-id="${s.id}" data-status="canceled" class="text-xs px-2 py-1 bg-slate-100 rounded">Cancelar</button>
        </div>
      `;
      el.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', async () => {
          await api.membership.updateSubscriptionStatus(
            btn.getAttribute('data-id')!,
            btn.getAttribute('data-status')!
          );
          window.location.reload();
        });
      });
      container.appendChild(el);
    });
  }).catch(() => {});

  content.querySelector('#plan-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    await api.membership.createPlan(Object.fromEntries(fd.entries()));
    window.location.reload();
  });

  content.querySelector('#sub-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = content.querySelector('#sub-msg') as HTMLElement;
    try {
      await api.membership.createSubscription(userSelect.value, planSelect.value);
      msg.textContent = 'Suscripción asignada';
      msg.className = 'text-sm mt-2 text-success';
      msg.classList.remove('hidden');
    } catch (err) {
      msg.textContent = (err as { message?: string }).message || 'Error';
      msg.className = 'text-sm mt-2 text-danger';
      msg.classList.remove('hidden');
    }
  });

  return Layout('Membresías', content, 'Planes y suscripciones');
}
