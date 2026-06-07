import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import { initRouter } from './router';
import { initSyncQueue } from './lib/syncQueue';

initSyncQueue();
initRouter();
