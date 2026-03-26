import { buildApp } from './app';
import { connectDB, disconnectDB } from './infrastructure/database/connection';
import { logger } from './shared/utils/logger';
import { config } from './shared/config/config';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Build Express App
    const app = buildApp();

    // 3. Start Listening
    const server = app.listen(config.port, () => {
      logger.info(
        `Server running in ${config.nodeEnv} mode on port ${config.port}`,
      );
      logger.info(`Health check: http://localhost:${config.port}/health`);
      logger.info(
        `API Docs: http://localhost:${config.port}/api-docs`,
      );
    });

    // 4. Graceful Shutdown Handlers
    const unexpectedErrorHandler = (error: Error) => {
      logger.fatal({ stack: error.stack }, `Unexpected Error: ${error.message}`);
      server.close(() => {
        logger.info('Server closed due to unexpected error.');
        disconnectDB().finally(() => process.exit(1));
      });
    };

    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Closing server gracefully.');
      server.close(() => {
        logger.info('HTTP server closed.');
        disconnectDB().finally(() => {
          logger.info('Graceful shutdown completed.');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received (Ctrl+C). Closing server gracefully.');
      server.close(() => {
        logger.info('HTTP server closed.');
        disconnectDB().finally(() => {
          logger.info('Graceful shutdown completed.');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    const err = error as Error;
    logger.fatal({ stack: err.stack }, `Failed to start application: ${err.message}`);
    process.exit(1);
  }
};

startServer();
