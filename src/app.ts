import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';

import { config } from './shared/config/config';
import { logger } from './shared/utils/logger';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler';
import { swaggerSpec } from './shared/config/swagger';

// Routes
import { authRoutes } from './modules/auth/auth.routes';
import { postRoutes } from './modules/posts/posts.routes';
import { userRoutes } from './modules/users/users.routes';
import { categoryRoutes } from './modules/categories/category.routes';
import { commentRoutes } from './modules/comments/comments.routes';

import { connectDB } from './infrastructure/database/connection';

export const buildApp = (): Express => {
  const app: Express = express();

  // Trust proxy for rate limiting on Vercel
  app.set('trust proxy', 1);

  // Database Connection Middleware (Ensures DB is ready on every request in serverless)
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      logger.error({ err: error }, 'Database connection middleware failed');
      res.status(503).json({
        success: false,
        message: 'Database connection currently unavailable. Please try again.',
        code: 'SERVICE_UNAVAILABLE',
      });
    }
  });

  // Basic Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );
  app.use(mongoSanitize()); // Prevent NoSQL Injection attacks

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
  });
  app.use('/api', limiter);

  // Logging
  app.use(
    pinoHttp({
      logger,
      autoLogging: config.isProduction, 
      customLogLevel: (req, _res, err) => {
        if (err || _res.statusCode >= 500) return 'error';
        if (_res.statusCode >= 400) return 'warn';
        return 'info';
      },
    })
  );

  // Health Check
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Swagger Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Blog Platform API Docs'
  }));
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // API Routes
  const v1Router = express.Router();
  
  v1Router.use('/auth', authRoutes);
  v1Router.use('/posts', postRoutes);
  v1Router.use('/users', userRoutes);
  v1Router.use('/categories', categoryRoutes);
  v1Router.use('/comments', commentRoutes);

  app.use('/api/v1', v1Router);

  // Error Handling (Must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
