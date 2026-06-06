/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}
