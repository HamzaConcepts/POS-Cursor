import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import salesRoutes from './routes/sales.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const getAllowedOrigins = () => {
  const candidates = [
    process.env.FRONTEND_URL,
    process.env.PUBLIC_FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined
  ];

  return candidates.filter((value) => Boolean(value)).map((value) => value.replace(/\/$/, ''));
};

export const createApp = () => {
  const app = express();

  const allowedOrigins = getAllowedOrigins();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.length === 0) {
          callback(null, true);
          return;
        }

        const sanitizedOrigin = origin.replace(/\/$/, '');
        const isAllowed = allowedOrigins.some((allowed) => allowed === sanitizedOrigin);

        if (isAllowed) {
          callback(null, true);
        } else if (process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'POS API is running',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      code: 'NOT_FOUND'
    });
  });

  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR'
    });
  });

  return app;
};

const app = createApp();

export default app;
