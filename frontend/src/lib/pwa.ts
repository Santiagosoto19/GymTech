import { registerSW } from 'virtual:pwa-register';

export function initPWA(): void {
  if (!('serviceWorker' in navigator)) return;

  registerSW({
    immediate: true,
    onOfflineReady() {
      console.info('[PWA] Lista para uso sin conexión');
    },
    onRegistered(registration) {
      console.info('[PWA] Service Worker registrado', registration?.scope);
    },
    onRegisterError(error) {
      console.error('[PWA] Error al registrar Service Worker', error);
    },
  });
}
