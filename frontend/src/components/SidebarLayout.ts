import { getUser } from '../state/auth';
import { NetworkBadge } from './NetworkBadge';
import { LogoutButton } from './LogoutButton';
import {
  getNavForRole,
  isNavActive,
  NAV_ICONS,
  PORTAL_SUBTITLES,
} from './navConfig';

export interface SidebarLayoutOptions {
  pageTitle?: string;
  pageSubtitle?: string;
  hideTopBar?: boolean;
}

export function SidebarLayout(
  content: HTMLElement,
  options: SidebarLayoutOptions = {}
): HTMLElement {
  const role = getUser()?.role || '';
  const currentHash = window.location.hash || '';
  const navItems = getNavForRole(role);
  const portalSubtitle = PORTAL_SUBTITLES[role] || 'GymTech';

  const shell = document.createElement('div');
  shell.className = 'app-shell';

  const sidebar = document.createElement('aside');
  sidebar.className = 'app-sidebar';
  sidebar.innerHTML = `
    <div class="app-sidebar__brand">
      <div class="app-sidebar__logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M6.5 6.5h11v11h-11z"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
        </svg>
      </div>
      <div>
        <div class="app-sidebar__title">GymTech</div>
        <div class="app-sidebar__subtitle">${portalSubtitle}</div>
      </div>
    </div>
    <nav class="app-sidebar__nav" id="app-sidebar-nav"></nav>
    <button type="button" class="app-sidebar__close" id="sidebar-close" aria-label="Cerrar menú">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  `;

  const nav = sidebar.querySelector('#app-sidebar-nav')!;
  navItems.forEach((item) => {
    const active = isNavActive(item.href, currentHash);
    const link = document.createElement('a');
    link.href = item.href;
    link.className = `app-sidebar__link${active ? ' app-sidebar__link--active' : ''}`;
    link.innerHTML = `
      <svg class="app-sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${NAV_ICONS[item.icon] || NAV_ICONS.home}
      </svg>
      <span>${item.label}</span>
    `;
    nav.appendChild(link);
  });

  const main = document.createElement('div');
  main.className = 'app-main';

  const topBar = document.createElement('header');
  topBar.className = 'app-main__topbar';

  if (options.hideTopBar) {
    topBar.classList.add('app-main__topbar--minimal');
    topBar.innerHTML = `
      <button type="button" class="app-main__menu-btn" id="sidebar-open" aria-label="Abrir menú">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M3 12h18M3 18h18"/>
        </svg>
      </button>
      <div class="app-main__topbar-actions" id="topbar-actions"></div>
    `;
  } else {
    topBar.innerHTML = `
      <div class="app-main__titles">
        <button type="button" class="app-main__menu-btn" id="sidebar-open" aria-label="Abrir menú">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M3 12h18M3 18h18"/>
          </svg>
        </button>
        <div>
          <h1 class="app-main__title">${options.pageTitle || ''}</h1>
          ${options.pageSubtitle ? `<p class="app-main__subtitle">${options.pageSubtitle}</p>` : ''}
        </div>
      </div>
      <div class="app-main__topbar-actions" id="topbar-actions"></div>
    `;
  }

  const actions = topBar.querySelector('#topbar-actions')!;
  actions.appendChild(NetworkBadge());
  actions.appendChild(LogoutButton());
  main.appendChild(topBar);

  const contentArea = document.createElement('main');
  contentArea.className = 'app-main__content';
  contentArea.appendChild(content);
  main.appendChild(contentArea);

  const overlay = document.createElement('div');
  overlay.className = 'app-sidebar-overlay hidden';

  shell.appendChild(sidebar);
  shell.appendChild(main);
  shell.appendChild(overlay);

  function openSidebar(): void {
    sidebar.classList.add('app-sidebar--open');
    overlay.classList.remove('hidden');
    document.body.classList.add('app-nav-open');
  }

  function closeSidebar(): void {
    sidebar.classList.remove('app-sidebar--open');
    overlay.classList.add('hidden');
    document.body.classList.remove('app-nav-open');
  }

  shell.querySelectorAll('#sidebar-open').forEach((btn) => {
    btn.addEventListener('click', openSidebar);
  });
  sidebar.querySelector('#sidebar-close')!.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeSidebar));

  return shell;
}
