import { onSyncChange } from '../lib/syncQueue';
import { isOnline } from '../lib/network';

export function OfflineBar(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'offline-bar';
  el.style.display = 'none';

  function update(count: number): void {
    if (count > 0) {
      el.style.display = 'flex';
      const label = count === 1 ? 'registro' : 'registros';
      const networkNote = isOnline() ? 'sincronizando...' : 'esperando señal de red';
      el.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <span><strong>${count}</strong> ${label} pendiente${count > 1 ? 's' : ''} por sincronizar — ${networkNote}</span>
      `;
    } else {
      el.style.display = 'none';
    }
  }

  const unsub = onSyncChange(update);
  el.dataset.unsub = 'true';
  (el as HTMLElement & { _unsub?: () => void })._unsub = unsub;

  return el;
}
