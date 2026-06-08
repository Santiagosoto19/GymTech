import { clearSession } from '../state/auth';
import { getConnectionLabel, isOnline, onNetworkChange } from '../lib/network';

export function UserMenu(firstName: string, lastName: string): HTMLElement {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
  const fullName = `${firstName} ${lastName}`.trim() || 'Usuario';

  const wrapper = document.createElement('div');
  wrapper.className = 'user-menu';

  function renderOnline(online: boolean): void {
    const status = wrapper.querySelector('#user-status') as HTMLElement;
    if (!status) return;
    status.className = `user-menu__status ${online ? 'user-menu__status--online' : 'user-menu__status--offline'}`;
    status.innerHTML = `<span class="user-menu__dot"></span>${getConnectionLabel()}`;
  }

  wrapper.innerHTML = `
    <button type="button" class="user-menu__trigger" id="user-menu-trigger" aria-haspopup="true" aria-expanded="false">
      <span class="user-menu__avatar">${initials}</span>
      <span class="user-menu__info">
        <span class="user-menu__name">${fullName}</span>
        <span class="user-menu__status user-menu__status--online" id="user-status">
          <span class="user-menu__dot"></span>En línea
        </span>
      </span>
      <svg class="user-menu__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </button>
    <div class="user-menu__dropdown hidden" id="user-menu-dropdown" role="menu">
      <button type="button" class="user-menu__item" id="user-menu-logout" role="menuitem">Cerrar sesión</button>
    </div>
  `;

  renderOnline(isOnline());
  onNetworkChange(renderOnline);

  const trigger = wrapper.querySelector('#user-menu-trigger') as HTMLButtonElement;
  const dropdown = wrapper.querySelector('#user-menu-dropdown') as HTMLElement;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle('hidden');
    trigger.setAttribute('aria-expanded', String(!open));
  });

  wrapper.querySelector('#user-menu-logout')!.addEventListener('click', () => {
    clearSession();
    window.location.hash = '/login';
  });

  document.addEventListener('click', () => {
    dropdown.classList.add('hidden');
    trigger.setAttribute('aria-expanded', 'false');
  });

  return wrapper;
}
