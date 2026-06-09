import { isOnline, onNetworkChange } from '../lib/network';

export function ConnectionBanner(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'connection-banner hidden';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');

  function render(online: boolean): void {
    document.body.classList.toggle('app-offline', !online);
    if (online) {
      el.classList.add('hidden');
      el.innerHTML = '';
      return;
    }
    el.classList.remove('hidden');
    el.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.58 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0"/>
      </svg>
      <span><strong>Sin conexión</strong> — Estás en modo offline. Los cambios se guardarán localmente.</span>
    `;
  }

  render(isOnline());
  onNetworkChange(render);
  return el;
}
