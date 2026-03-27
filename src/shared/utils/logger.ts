import pino from 'pino';
import { config } from '../config/config';

export const logger = pino({
  level: config.logLevel,
  transport:
    config.isDevelopment && !process.env.VERCEL
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  base: {
    service: 'blog-platform-api',
    env: config.nodeEnv,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
