import { clearSession } from '../state/auth';

export function LogoutButton(): HTMLElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn-logout';
  btn.setAttribute('aria-label', 'Cerrar sesión');
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
    <span>Cerrar sesión</span>
  `;
  btn.onclick = () => {
    clearSession();
    window.location.hash = '/login';
  };
  return btn;
}
