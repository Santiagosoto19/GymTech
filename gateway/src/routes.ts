import { IncomingMessage } from 'http';
import { Express } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { config } from './config';
import { AuthenticatedRequest } from './middleware/auth';

function createServiceProxy(pathPrefix: string, target: string): Options {
  return {
    target,
    changeOrigin: true,
    pathRewrite: (path) => `${pathPrefix}${path}`,
    on: {
      proxyReq: (proxyReq, req: IncomingMessage) => {
        const authReq = req as AuthenticatedRequest;
        if (authReq.user) {
          proxyReq.setHeader('x-user-id', authReq.user.userId);
          proxyReq.setHeader('x-user-role', authReq.user.role);
        }
      },
      error: (_err, _req, res) => {
        if ('writeHead' in res && typeof res.writeHead === 'function') {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: false,
              error: { message: 'Service unavailable' },
            })
          );
        }
      },
    },
  };
}

export function setupRoutes(app: Express): void {
  app.use(
    '/api/v1/auth',
    createProxyMiddleware(createServiceProxy('/api/v1/auth', config.services.auth))
  );

  app.use(
    '/api/v1/membership',
    createProxyMiddleware(createServiceProxy('/api/v1/membership', config.services.membership))
  );

  app.use(
    '/api/v1/activity',
    createProxyMiddleware(createServiceProxy('/api/v1/activity', config.services.activity))
  );

  app.use(
    '/api/v1/reporting',
    createProxyMiddleware(createServiceProxy('/api/v1/reporting', config.services.reporting))
  );

  app.use(
    '/api/v1/notification',
    createProxyMiddleware(createServiceProxy('/api/v1/notification', config.services.notification))
  );
}
