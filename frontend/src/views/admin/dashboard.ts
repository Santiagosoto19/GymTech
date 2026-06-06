import { api } from '../../lib/api';
import { Layout } from '../../components/Layout';

export function AdminDashboard(): HTMLElement {
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="kpi-grid mb-8">
      <div class="kpi-card"><div class="value" id="kpi-occupancy">—</div><div class="label">Aforo actual</div></div>
      <div class="kpi-card"><div class="value" id="kpi-revenue">—</div><div class="label">Ingresos mensuales</div></div>
      <div class="kpi-card"><div class="value" id="kpi-churn">—</div><div class="label">Tasa de deserción</div></div>
      <div class="kpi-card"><div class="value" id="kpi-active">—</div><div class="label">Suscripciones activas</div></div>
    </div>
    <div class="glass-card panel-card">
      <h2 class="font-bold mb-3 gradient-text">Accesos rápidos</h2>
      <div class="flex flex-wrap gap-2">
        <a href="#/admin/users" class="btn-primary text-sm">Gestionar usuarios</a>
        <a href="#/admin/memberships" class="btn-secondary text-sm">Planes y suscripciones</a>
        <a href="#/admin/reports" class="btn-secondary text-sm">Generar reportes</a>
        <a href="#/reception" class="btn-primary text-sm">Asistencia rápida</a>
      </div>
    </div>
  `;

  api.membership.getDashboardStats().then((s) => {
    (content.querySelector('#kpi-occupancy') as HTMLElement).textContent = String(s.occupancy);
    (content.querySelector('#kpi-revenue') as HTMLElement).textContent = `$${s.monthlyRevenue.toFixed(2)}`;
    (content.querySelector('#kpi-churn') as HTMLElement).textContent = `${s.churnRate}%`;
    (content.querySelector('#kpi-active') as HTMLElement).textContent = String(s.activeSubscriptions);
  }).catch(() => {
    api.membership.getOccupancy().then((o) => {
      (content.querySelector('#kpi-occupancy') as HTMLElement).textContent = `${o.current}/${o.max}`;
    }).catch(() => {});
  });

  return Layout('Dashboard', content, 'Panel de Administrador');
}
