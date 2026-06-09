import { api, lookupClient, type ClientLookup } from '../../lib/api';
import { enqueueAttendance } from '../../lib/indexeddb';
import { onSyncChange, registerBackgroundSync } from '../../lib/syncQueue';
import { isOnline } from '../../lib/network';
import { OfflineBar } from '../../components/OfflineBar';
import { Layout } from '../../components/Layout';

export function AttendanceView(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'max-w-lg mx-auto space-y-4';
  content.innerHTML = `
    <div class="glass-card panel-card flex justify-between items-center">
      <span class="text-sm font-semibold text-secondary">Aforo en tiempo real</span>
      <span class="text-2xl font-extrabold gradient-text" id="occupancy">—</span>
    </div>
    <div class="glass-card panel-card">
      <label class="block text-sm font-medium text-secondary mb-2">Buscar por identificación</label>
      <div class="flex gap-2">
        <input id="doc-search" class="input-field flex-1" placeholder="Número de documento" />
        <button id="search-btn" class="btn-primary px-4">Buscar</button>
      </div>
      <p id="search-error" class="text-danger text-xs mt-2 hidden"></p>
    </div>
    <div id="client-card" class="hidden"></div>
  `;

  const wrapper = document.createElement('div');
  wrapper.appendChild(content);
  wrapper.appendChild(OfflineBar());

  api.membership.getOccupancy().then((o) => {
    (content.querySelector('#occupancy') as HTMLElement).textContent = `${o.current}/${o.max}`;
  }).catch(() => {});

  const docInput = content.querySelector('#doc-search') as HTMLInputElement;
  const searchBtn = content.querySelector('#search-btn') as HTMLButtonElement;
  const searchError = content.querySelector('#search-error') as HTMLElement;
  const clientCard = content.querySelector('#client-card') as HTMLElement;

  function statusBadge(status: string): string {
    const map: Record<string, { cls: string; label: string }> = {
      active: { cls: 'active', label: 'Activo' },
      expired: { cls: 'expired', label: 'Vencido' },
      suspended: { cls: 'expired', label: 'Congelado' },
      canceled: { cls: 'inactive', label: 'Cancelado' },
    };
    const s = map[status] || { cls: 'inactive', label: status };
    return `<span class="status-badge ${s.cls}">${s.label}</span>`;
  }

  function renderClient(client: ClientLookup): void {
    const canCheckIn = client.subscriptionStatus === 'active';
    clientCard.className = 'glass-card panel-card animate-slide-up';
    clientCard.innerHTML = `
      <div class="flex items-center gap-4 mb-4">
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-indigo-100 flex items-center justify-center text-xl font-bold text-accent">
          ${client.firstName.charAt(0)}${client.lastName.charAt(0)}
        </div>
        <div class="flex-1">
          <h2 class="text-lg font-semibold">${client.firstName} ${client.lastName}</h2>
          <p class="text-sm text-muted">Doc: ${client.documentNumber}</p>
          ${client.membershipName ? `<p class="text-xs text-muted">${client.membershipName}</p>` : ''}
        </div>
        ${statusBadge(client.subscriptionStatus)}
      </div>
      <div class="flex gap-2">
        <button id="checkin-btn" class="btn-primary flex-1 py-3" ${canCheckIn ? '' : 'disabled'}>Registrar entrada</button>
        <button id="checkout-btn" class="btn-secondary flex-1 py-3" ${canCheckIn ? '' : 'disabled'}>Registrar salida</button>
      </div>
      <p id="checkin-msg" class="text-center text-sm mt-2 hidden"></p>
    `;

    async function register(type: 'check_in' | 'check_out'): Promise<void> {
      const msg = clientCard.querySelector('#checkin-msg') as HTMLElement;
      const key = crypto.randomUUID();
      try {
        if (isOnline()) {
          await api.membership.registerAttendance(client.userId, type, key);
          msg.textContent = type === 'check_in' ? 'Entrada registrada' : 'Salida registrada';
          msg.className = 'text-center text-sm mt-2 text-success';
        } else if (type === 'check_in') {
          await enqueueAttendance({ id: crypto.randomUUID(), userId: client.userId, timestamp: new Date().toISOString(), idempotencyKey: key });
          await registerBackgroundSync();
          msg.textContent = 'Guardado localmente — se sincronizará al recuperar conexión';
          msg.className = 'text-center text-sm mt-2 text-warning';
        }
        msg.classList.remove('hidden');
        api.membership.getOccupancy().then((o) => {
          (content.querySelector('#occupancy') as HTMLElement).textContent = `${o.current}/${o.max}`;
        }).catch(() => {});
      } catch (err) {
        msg.textContent = (err as { message?: string }).message || 'Error';
        msg.className = 'text-center text-sm mt-2 text-danger';
        msg.classList.remove('hidden');
      }
    }

    if (canCheckIn) {
      clientCard.querySelector('#checkin-btn')!.addEventListener('click', () => register('check_in'));
      clientCard.querySelector('#checkout-btn')!.addEventListener('click', () => register('check_out'));
    }
    clientCard.classList.remove('hidden');
  }

  async function search(): Promise<void> {
    const doc = docInput.value.trim();
    searchError.classList.add('hidden');
    clientCard.classList.add('hidden');
    if (!doc) { searchError.textContent = 'Ingrese un documento'; searchError.classList.remove('hidden'); return; }
    searchBtn.disabled = true;
    try {
      renderClient(await lookupClient(doc));
    } catch (err) {
      searchError.textContent = (err as { message?: string }).message || 'No encontrado';
      searchError.classList.remove('hidden');
    } finally {
      searchBtn.disabled = false;
    }
  }

  searchBtn.addEventListener('click', search);
  docInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(); });
  onSyncChange(() => {});

  return Layout('Asistencia Rápida', wrapper, 'Recepción');
}
