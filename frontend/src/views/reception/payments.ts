import { api } from '../../lib/api';
import { Layout } from '../../components/Layout';

export function ReceptionPayments(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'max-w-lg space-y-4';
  content.innerHTML = `
    <div class="glass-card panel-card">
      <h2 class="font-semibold mb-4">Registrar pago</h2>
      <form id="pay-form" class="space-y-3">
        <select class="input-field" id="user-select" required><option value="">Cliente...</option></select>
        <select class="input-field" id="plan-select"><option value="">Plan (opcional)</option></select>
        <input class="input-field" name="amount" type="number" step="0.01" placeholder="Monto" required />
        <select class="input-field" name="method">
          <option value="cash">Efectivo</option>
          <option value="card">Tarjeta</option>
          <option value="transfer">Transferencia</option>
        </select>
        <button class="btn-primary w-full">Registrar pago</button>
      </form>
      <p id="msg" class="text-sm mt-2 hidden"></p>
    </div>
    <div class="glass-card panel-card">
      <h2 class="font-semibold mb-4">Consultar pagos</h2>
      <div class="grid grid-cols-2 gap-2 mb-3">
        <input type="date" id="from" class="input-field" />
        <input type="date" id="to" class="input-field" />
      </div>
      <button id="search-payments" class="btn-primary w-full mb-3">Buscar</button>
      <p id="filter-err" class="text-danger text-sm hidden">Fechas obligatorias</p>
      <div id="payments-list" class="space-y-2"></div>
    </div>
  `;

  const userSelect = content.querySelector('#user-select') as HTMLSelectElement;
  const planSelect = content.querySelector('#plan-select') as HTMLSelectElement;

  Promise.all([api.auth.getClients(), api.membership.getPlans()]).then(([{ users }, plans]) => {
    users.forEach((u) => {
      const o = document.createElement('option');
      o.value = u.id;
      o.textContent = `${u.firstName} ${u.lastName}`;
      userSelect.appendChild(o);
    });
    plans.forEach((p) => {
      const o = document.createElement('option');
      o.value = p.id;
      o.textContent = p.name;
      planSelect.appendChild(o);
    });
  });

  content.querySelector('#pay-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const msg = content.querySelector('#msg') as HTMLElement;
    try {
      await api.membership.recordPayment({
        userId: userSelect.value,
        planId: planSelect.value || undefined,
        amount: parseFloat(fd.get('amount') as string),
        method: fd.get('method') as string,
      });
      msg.textContent = 'Pago registrado';
      msg.className = 'text-sm mt-2 text-success';
      msg.classList.remove('hidden');
    } catch (err) {
      msg.textContent = (err as { message?: string }).message || 'Error';
      msg.className = 'text-sm mt-2 text-danger';
      msg.classList.remove('hidden');
    }
  });

  content.querySelector('#search-payments')!.addEventListener('click', async () => {
    const from = (content.querySelector('#from') as HTMLInputElement).value;
    const to = (content.querySelector('#to') as HTMLInputElement).value;
    const err = content.querySelector('#filter-err') as HTMLElement;
    const list = content.querySelector('#payments-list')!;
    if (!from || !to) { err.classList.remove('hidden'); return; }
    err.classList.add('hidden');
    const payments = await api.membership.listPayments(from, to);
    list.innerHTML = payments.map((p) =>
      `<div class="p-3 bg-slate-100 rounded-lg text-sm">$${p.amount} · ${p.method} · ${new Date(p.recordedAt).toLocaleDateString()}</div>`
    ).join('') || '<p class="text-muted">Sin resultados</p>';
  });

  return Layout('Pagos', content, 'Recepción');
}
