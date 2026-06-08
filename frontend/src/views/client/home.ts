import { api, type AttendanceStats } from '../../lib/api';
import { onAttendanceChange } from '../../lib/dataRefresh';
import { getUser } from '../../state/auth';
import { ClientLayout } from '../../components/ClientLayout';
import { renderRoutinePreview } from './routine';

export function ClientHome(): HTMLElement {
  const user = getUser();
  const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Cliente';

  const content = document.createElement('div');
  content.className = 'client-page';
  content.innerHTML = `
    <div class="client-hero glass-card client-hero--gradient">
      <div>
        <p class="client-hero__eyebrow">Portal del Cliente</p>
        <h2 class="client-hero__title">Hola, ${name}</h2>
        <p class="client-hero__text">Gestiona tu membresía, reserva clases y mantente al día con tus alertas.</p>
      </div>
      <a href="#/client" class="btn-primary text-sm shrink-0">Ver mi tarjeta</a>
    </div>

    <div class="client-kpi-row" id="home-kpis">
      <div class="client-kpi-card"><span class="client-kpi-card__value" id="kpi-days">—</span><span class="client-kpi-card__label">Días restantes</span></div>
      <div class="client-kpi-card"><span class="client-kpi-card__value" id="kpi-entries">—</span><span class="client-kpi-card__label">Entradas restantes</span></div>
      <div class="client-kpi-card"><span class="client-kpi-card__value" id="kpi-reservations">—</span><span class="client-kpi-card__label">Clases reservadas</span></div>
      <div class="client-kpi-card"><span class="client-kpi-card__value" id="kpi-alerts">—</span><span class="client-kpi-card__label">Alertas pendientes</span></div>
    </div>

    <h3 class="client-section-title gradient-text">Accesos rápidos</h3>
    <div class="client-quick-grid">
      <a href="#/client" class="client-quick-card">
        <span class="client-quick-card__icon">QR</span>
        <span class="client-quick-card__label">Mi tarjeta</span>
        <span class="client-quick-card__hint">Código de acceso</span>
      </a>
      <a href="#/client/classes" class="client-quick-card">
        <span class="client-quick-card__icon">CL</span>
        <span class="client-quick-card__label">Actividades</span>
        <span class="client-quick-card__hint">Calendario y reservas</span>
      </a>
      <a href="#/client/routine" class="client-quick-card">
        <span class="client-quick-card__icon">RT</span>
        <span class="client-quick-card__label">Mi rutina</span>
        <span class="client-quick-card__hint">Ejercicios asignados</span>
      </a>
      <a href="#/client/profile" class="client-quick-card">
        <span class="client-quick-card__icon">PF</span>
        <span class="client-quick-card__label">Perfil</span>
        <span class="client-quick-card__hint">Datos personales</span>
      </a>
    </div>

    <h3 class="client-section-title gradient-text mt-6">Resumen</h3>
    <div class="client-summary-grid">
      <div class="client-summary-card glass-card">
        <span class="client-summary-card__num" id="summary-checkins">—</span>
        <span class="client-summary-card__lbl">Tus visitas este mes</span>
      </div>
      <div class="client-summary-card glass-card">
        <span class="client-summary-card__num" id="summary-classes">—</span>
        <span class="client-summary-card__lbl">Clases programadas</span>
      </div>
    </div>

    <div id="routine-preview" class="mt-6 hidden"></div>
    <div id="upcoming-classes" class="mt-6 hidden"></div>
  `;

  function applyStats(stats: AttendanceStats | null): void {
    if (!stats) return;
    (content.querySelector('#kpi-entries') as HTMLElement).textContent =
      stats.remainingEntries !== null ? String(stats.remainingEntries) : '∞';
    (content.querySelector('#summary-checkins') as HTMLElement).textContent = String(stats.monthlyCheckIns);
  }

  async function loadData(): Promise<void> {
    if (!user) return;
    const [sub, stats, reservations, notifs, classes, schedules, routine] = await Promise.all([
      api.membership.validateSubscription(user.id).catch(() => null),
      api.membership.getAttendanceStats(user.id).catch(() => null),
      api.activity.getMyReservations().catch(() => []),
      api.notification.getByUser(user.id).catch(() => []),
      api.activity.getClasses().catch(() => []),
      api.activity.getSchedules().catch(() => []),
      api.activity.getMyRoutine().catch(() => null),
    ]);

    if (sub?.subscription) {
      const end = new Date(sub.subscription.endDate);
      const days = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
      (content.querySelector('#kpi-days') as HTMLElement).textContent = String(days);
    } else {
      (content.querySelector('#kpi-days') as HTMLElement).textContent = '0';
    }

    applyStats(stats);
    (content.querySelector('#kpi-reservations') as HTMLElement).textContent = String(reservations.length);
    (content.querySelector('#kpi-alerts') as HTMLElement).textContent =
      String(notifs.filter((n) => n.status !== 'read').length);

    const now = Date.now();
    (content.querySelector('#summary-classes') as HTMLElement).textContent =
      String(schedules.filter((s) => new Date(s.startTime).getTime() >= now).length);

    const routineEl = content.querySelector('#routine-preview') as HTMLElement;
    routineEl.className = 'mt-6';
    routineEl.innerHTML = `
      <h3 class="client-section-title gradient-text">Mi rutina</h3>
      <div class="glass-card panel-card">${renderRoutinePreview(routine)}</div>
    `;

    const upcoming = schedules
      .filter((s) => new Date(s.startTime).getTime() >= now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 3);

    if (upcoming.length) {
      const reservedIds = new Set(reservations.map((r) => r.classId));
      const section = content.querySelector('#upcoming-classes') as HTMLElement;
      section.className = 'mt-6';
      section.innerHTML = `
        <h3 class="client-section-title gradient-text">Próximas clases</h3>
        <div class="space-y-2">
          ${upcoming.map((s) => {
            const cls = classes.find((c) => c.id === s.classId);
            const start = new Date(s.startTime);
            return `
              <div class="glass-card panel-card flex justify-between items-center">
                <div>
                  <strong>${cls?.name || 'Clase'}</strong>
                  <p class="text-xs text-muted">${start.toLocaleString('es')} · ${s.room}</p>
                </div>
                ${reservedIds.has(s.classId) ? '<span class="pill-badge text-xs">Reservada</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  if (user) {
    loadData().catch(() => {});
    const unsub = onAttendanceChange((userId) => {
      if (userId === user.id) loadData().catch(() => {});
    });
    const onVisible = () => { if (document.visibilityState === 'visible') loadData().catch(() => {}); };
    document.addEventListener('visibilitychange', onVisible);
    (content as HTMLElement & { _cleanup?: () => void })._cleanup = () => {
      unsub();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }

  return ClientLayout(content, {
    pageTitle: 'Inicio',
    pageSubtitle: 'Resumen de tu cuenta',
  });
}
