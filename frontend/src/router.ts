import { isAuthenticated, getUser, getDefaultRoute, clearSession } from './state/auth';
import { LoginView } from './views/public/login';
import { AttendanceView } from './views/reception/attendance';
import { ReceptionMemberships } from './views/reception/memberships';
import { ReceptionPayments } from './views/reception/payments';
import { AdminDashboard } from './views/admin/dashboard';
import { AdminUsers } from './views/admin/users';
import { AdminReports } from './views/admin/reports';
import { AdminMemberships } from './views/admin/memberships';
import { AdminAudit } from './views/admin/audit';
import { TrainerClients } from './views/trainer/clients';
import { TrainerRoutines } from './views/trainer/routines';
import { TrainerSchedule } from './views/trainer/schedule';
import { TrainerClasses } from './views/trainer/classes';
import { ClientCard } from './views/client/card';
import { ClientHome } from './views/client/home';
import { ClientClasses } from './views/client/classes';
import { ClientProfile } from './views/client/profile';
import { ClientSettings } from './views/client/settings';

type RouteHandler = () => HTMLElement;

const publicRoutes: Record<string, RouteHandler> = {
  '/login': LoginView,
};

const protectedRoutes: Record<string, { handler: RouteHandler; roles: string[] }> = {
  '/admin': { handler: AdminDashboard, roles: ['admin'] },
  '/admin/users': { handler: AdminUsers, roles: ['admin'] },
  '/admin/memberships': { handler: AdminMemberships, roles: ['admin'] },
  '/admin/reports': { handler: AdminReports, roles: ['admin'] },
  '/admin/audit': { handler: AdminAudit, roles: ['admin'] },
  '/reception': { handler: AttendanceView, roles: ['receptionist', 'admin'] },
  '/reception/memberships': { handler: ReceptionMemberships, roles: ['receptionist', 'admin'] },
  '/reception/payments': { handler: ReceptionPayments, roles: ['receptionist', 'admin'] },
  '/trainer': { handler: TrainerClients, roles: ['trainer', 'admin'] },
  '/trainer/routines': { handler: TrainerRoutines, roles: ['trainer', 'admin'] },
  '/trainer/schedule': { handler: TrainerSchedule, roles: ['trainer', 'admin'] },
  '/trainer/classes': { handler: TrainerClasses, roles: ['trainer', 'admin'] },
  '/client': { handler: ClientCard, roles: ['client'] },
  '/client/home': { handler: ClientHome, roles: ['client'] },
  '/client/classes': { handler: ClientClasses, roles: ['client'] },
  '/client/profile': { handler: ClientProfile, roles: ['client'] },
  '/client/settings': { handler: ClientSettings, roles: ['client'] },
  '/client/notifications': { handler: ClientSettings, roles: ['client'] },
};

function parseHash(): string {
  const hash = window.location.hash.replace('#', '') || '/login';
  return hash.startsWith('/') ? hash : `/${hash}`;
}

function hasRole(allowed: string[]): boolean {
  const user = getUser();
  return !!user && allowed.includes(user.role);
}

export function navigate(): void {
  const path = parseHash();
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = '';

  if (publicRoutes[path]) {
    if (isAuthenticated() && path === '/login') {
      window.location.hash = getDefaultRoute(getUser()?.role || 'client');
      return;
    }
    app.appendChild(publicRoutes[path]());
    return;
  }

  if (path === '/client/health' || path === '/client/routine') {
    window.location.hash = '/client/home';
    return;
  }

  const route = protectedRoutes[path];
  if (!route) {
    window.location.hash = isAuthenticated() ? getDefaultRoute(getUser()?.role || 'client') : '/login';
    return;
  }
  if (!isAuthenticated()) { window.location.hash = '/login'; return; }
  if (!hasRole(route.roles)) { clearSession(); window.location.hash = '/login'; return; }

  app.appendChild(route.handler());
}

export function initRouter(): void {
  window.addEventListener('hashchange', navigate);
  navigate();
}
