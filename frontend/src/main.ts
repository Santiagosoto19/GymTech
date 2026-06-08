import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './lib/network';
import { initRouter } from './router';
import { initSyncQueue } from './lib/syncQueue';
import { initPWA } from './lib/pwa';

initPWA();
initSyncQueue();
initRouter();
