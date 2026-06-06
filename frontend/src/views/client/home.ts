import { api } from '../../lib/api';
import { getUser } from '../../state/auth';
import { ClientLayout } from '../../components/ClientLayout';

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
      <div class="client-kpi-card"><span class="client-kpi-card__value" id="kpi-reservations">—</span><span class="client-kpi-card__label">Clases reservadas</span></div>
      <div class="client-kpi-card"><span class="client-kpi-card__value" id="kpi-alerts">—</span><span class="client-kpi-card__label">Alertas pendientes</span></div>
      <div class="client-kpi-card"><span class="client-kpi-card__value" id="kpi-plan">—</span><span class="client-kpi-card__label">Plan activo</span></div>
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
      <a href="#/client/profile" class="client-quick-card">
        <span class="client-quick-card__icon">PF</span>
        <span class="client-quick-card__label">Perfil</span>
        <span class="client-quick-card__hint">Datos personales</span>
      </a>
      <a href="#/client/settings" class="client-quick-card">
        <span class="client-quick-card__icon">AJ</span>
        <span class="client-quick-card__label">Ajustes</span>
        <span class="client-quick-card__hint">Preferencias y alertas</span>
      </a>
    </div>

    <h3 class="client-section-title gradient-text mt-6">Resumen</h3>
    <div class="client-summary-grid">
      <div class="client-summary-card glass-card">
        <span class="client-summary-card__num" id="summary-checkins">12</span>
        <span class="client-summary-card__lbl">Tus visitas este mes</span>
      </div>
      <div class="client-summary-card glass-card">
        <span class="client-summary-card__num" id="summary-classes">—</span>
        <span class="client-summary-card__lbl">Clases disponibles</span>
      </div>
    </div>
  `;

  if (user) {
    Promise.all([
      api.membership.validateSubscription(user.id).catch(() => null),
      api.activity.getMyReservations().catch(() => []),
      api.notification.getByUser(user.id).catch(() => []),
      api.activity.getClasses().catch(() => []),
      api.membership.getPlans().catch(() => []),
    ]).then(([sub, reservations, notifs, classes, plans]) => {
      if (sub?.subscription) {
        const end = new Date(sub.subscription.endDate);
        const days = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
        (content.querySelector('#kpi-days') as HTMLElement).textContent = String(days);
        const plan = plans.find((p) => p.id === sub.subscription.planId);
        (content.querySelector('#kpi-plan') as HTMLElement).textContent = plan?.name?.split(' ')[0] || 'Activo';
      } else {
        (content.querySelector('#kpi-days') as HTMLElement).textContent = '0';
        (content.querySelector('#kpi-plan') as HTMLElement).textContent = '—';
      }
      (content.querySelector('#kpi-reservations') as HTMLElement).textContent = String(reservations.length);
      const pending = notifs.filter((n) => n.status !== 'read').length;
      (content.querySelector('#kpi-alerts') as HTMLElement).textContent = String(pending);
      (content.querySelector('#summary-classes') as HTMLElement).textContent = String(classes.length);
    });
  }

  return ClientLayout(content, {
    pageTitle: 'Inicio',
    pageSubtitle: 'Resumen de tu cuenta',
  });
}
