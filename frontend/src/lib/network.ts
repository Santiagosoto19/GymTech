type NetworkListener = (online: boolean) => void;

const listeners = new Set<NetworkListener>();

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onNetworkChange(cb: NetworkListener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify(): void {
  const online = navigator.onLine;
  listeners.forEach((cb) => cb(online));
}

window.addEventListener('online', notify);
window.addEventListener('offline', notify);
