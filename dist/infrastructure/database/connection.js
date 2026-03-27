"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../../shared/utils/logger");
const config_1 = require("../../shared/config/config");
let isConnected = false;
const connectDB = async () => {
    if (mongoose_1.default.connection.readyState >= 1) {
        logger_1.logger.info('Using existing MongoDB connection');
        return;
    }
    try {
        mongoose_1.default.set('strictQuery', true);
        const conn = await mongoose_1.default.connect(config_1.config.mongodbUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 2,
            family: 4, // Force IPv4 to avoid DNS resolution issues on some machines
        });
        isConnected = true;
        logger_1.logger.info(`MongoDB connected: ${conn.connection.host}`);
        mongoose_1.default.connection.on('disconnected', () => {
            isConnected = false;
            logger_1.logger.warn('MongoDB disconnected');
        });
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.logger.error(`MongoDB connection error: ${err.message}`);
            isConnected = false;
        });
        mongoose_1.default.connection.on('reconnected', () => {
            isConnected = true;
            logger_1.logger.info('MongoDB reconnected');
        });
    }
    catch (error) {
        const err = error;
        logger_1.logger.error(`MongoDB connection failed: ${err.message}`);
        throw err;
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    if (!isConnected)
        return;
    await mongoose_1.default.disconnect();
    isConnected = false;
    logger_1.logger.info('MongoDB disconnected gracefully');
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=connection.js.map