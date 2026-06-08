export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const NAV_ICONS: Record<string, string> = {
  home: '<path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"/>',
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  users: '<circle cx="9" cy="7" r="3"/><path d="M2 20c0-4 3.5-6 7-6s7 2 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M14 20c0-3 2-4.5 5-4.5"/>',
  membership: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/>',
  reports: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  audit: '<path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/>',
  attendance: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',
  payments: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  clients: '<circle cx="9" cy="7" r="3"/><path d="M2 20c0-4 3.5-6 7-6"/><path d="M16 11h6M19 8v6"/>',
  routines: '<path d="M6 4h12v4H6zM4 8h16v12H4z"/>',
  schedule: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  classes: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',
  activities: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2"/>',
  reception: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
};

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  admin: [
    { href: '#/admin', label: 'Dashboard', icon: 'dashboard' },
    { href: '#/admin/users', label: 'Usuarios', icon: 'users' },
    { href: '#/admin/memberships', label: 'Membresías', icon: 'membership' },
    { href: '#/admin/reports', label: 'Reportes', icon: 'reports' },
    { href: '#/admin/audit', label: 'Auditoría', icon: 'audit' },
    { href: '#/reception', label: 'Recepción', icon: 'reception' },
  ],
  receptionist: [
    { href: '#/reception', label: 'Asistencia', icon: 'attendance' },
    { href: '#/reception/memberships', label: 'Membresías', icon: 'membership' },
    { href: '#/reception/payments', label: 'Pagos', icon: 'payments' },
  ],
  trainer: [
    { href: '#/trainer', label: 'Clientes', icon: 'clients' },
    { href: '#/trainer/routines', label: 'Rutinas', icon: 'routines' },
    { href: '#/trainer/schedule', label: 'Calendario', icon: 'schedule' },
    { href: '#/trainer/classes', label: 'Clases', icon: 'classes' },
  ],
  client: [
    { href: '#/client/home', label: 'Inicio', icon: 'home' },
    { href: '#/client', label: 'Membresías', icon: 'membership' },
    { href: '#/client/classes', label: 'Actividades', icon: 'activities' },
    { href: '#/client/routine', label: 'Mi rutina', icon: 'routines' },
    { href: '#/client/profile', label: 'Perfil', icon: 'profile' },
    { href: '#/client/settings', label: 'Ajustes', icon: 'settings' },
  ],
};

export const PORTAL_SUBTITLES: Record<string, string> = {
  admin: 'Panel de Administración',
  receptionist: 'Recepción',
  trainer: 'Panel del Entrenador',
  client: 'Portal del Cliente',
};

const ACTIVE_ALIASES: Record<string, string[]> = {
  '#/client/settings': ['#/client/notifications'],
};

export function getNavForRole(role: string): NavItem[] {
  return NAV_BY_ROLE[role] || [];
}

export function isNavActive(href: string, currentHash: string): boolean {
  if (currentHash === href) return true;
  if (href === '#/client' && currentHash === '#/client/') return true;
  return (ACTIVE_ALIASES[href] || []).includes(currentHash);
}
