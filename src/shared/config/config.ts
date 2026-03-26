import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  mongodbUri: process.env.MONGODB_URI as string,

  // JWT
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET as string),
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Vercel Blob
  blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN || '',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),

  // Security
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),

  // Upload limits
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
};

export type Config = typeof config;
