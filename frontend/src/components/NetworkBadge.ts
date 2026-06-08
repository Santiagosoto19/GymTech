import { getConnectionLabel, isOnline, onNetworkChange } from '../lib/network';

export function NetworkBadge(): HTMLElement {
  const el = document.createElement('div');
  el.className = `network-badge ${isOnline() ? 'online' : 'offline'}`;
  el.setAttribute('aria-live', 'polite');

  function render(online: boolean): void {
    el.className = `network-badge ${online ? 'online' : 'offline'}`;
    el.innerHTML = `<span class="dot"></span>${getConnectionLabel()}`;
  }

  render(isOnline());
  onNetworkChange(render);
  return el;
}
