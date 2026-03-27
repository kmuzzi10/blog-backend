"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const connection_1 = require("./infrastructure/database/connection");
const logger_1 = require("./shared/utils/logger");
const config_1 = require("./shared/config/config");
// 1. Build Express App
const app = (0, app_1.buildApp)();
// 2. Database Connection
// In serverless environments (Vercel), we don't necessarily want to block 
// everything on this, but standard Express on Vercel can handle it.
const startServer = async () => {
    try {
        await (0, connection_1.connectDB)();
        // 3. Start Listening for local development
        // In Vercel, app.listen() is not required and can cause issues if it blocks.
        if (config_1.config.nodeEnv !== 'production') {
            const server = app.listen(config_1.config.port, () => {
                logger_1.logger.info(`Server running in ${config_1.config.nodeEnv} mode on port ${config_1.config.port}`);
                logger_1.logger.info(`Health check: http://localhost:${config_1.config.port}/health`);
                logger_1.logger.info(`API Docs: http://localhost:${config_1.config.port}/api-docs`);
            });
            // 4. Graceful Shutdown Handlers (Only for local/standalone)
            const unexpectedErrorHandler = (error) => {
                logger_1.logger.fatal({ stack: error.stack }, `Unexpected Error: ${error.message}`);
                server.close(() => {
                    logger_1.logger.info('Server closed due to unexpected error.');
                    (0, connection_1.disconnectDB)().finally(() => process.exit(1));
                });
            };
            process.on('uncaughtException', unexpectedErrorHandler);
            process.on('unhandledRejection', unexpectedErrorHandler);
            process.on('SIGTERM', () => {
                logger_1.logger.info('SIGTERM received. Closing server gracefully.');
                server.close(() => {
                    logger_1.logger.info('HTTP server closed.');
                    (0, connection_1.disconnectDB)().finally(() => {
                        logger_1.logger.info('Graceful shutdown completed.');
                        process.exit(0);
                    });
                });
            });
            process.on('SIGINT', () => {
                logger_1.logger.info('SIGINT received (Ctrl+C). Closing server gracefully.');
                server.close(() => {
                    logger_1.logger.info('HTTP server closed.');
                    (0, connection_1.disconnectDB)().finally(() => {
                        logger_1.logger.info('Graceful shutdown completed.');
                        process.exit(0);
                    });
                });
            });
        }
    }
    catch (error) {
        const err = error;
        logger_1.logger.fatal({ stack: err.stack }, `Failed to initialize server: ${err.message}`);
        // Still export the app so Vercel can handle the error route
    }
};
// Start the server initialization (Only for local dev)
if (config_1.config.nodeEnv !== 'production') {
    startServer();
}
// Export the app for Vercel
exports.default = app;
//# sourceMappingURL=server.js.map