import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { authMiddleware } from './middleware/auth';
import { setupRoutes } from './routes';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: config.frontendOrigin,
    credentials: true,
  })
);
app.use(morgan('combined'));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { message: 'Too many requests, please try again later.' },
    },
  })
);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP', service: 'gateway' });
});

app.use(authMiddleware);
setupRoutes(app);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' },
  });
});

app.listen(config.port, () => {
  console.log(`Gateway running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`CORS origin: ${config.frontendOrigin}`);
});
