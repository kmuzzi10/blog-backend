import mongoose from 'mongoose';
import { logger } from '../../shared/utils/logger';
import { config } from '../../shared/config/config';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    logger.info('Using existing MongoDB connection');
    return;
  }

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    isConnected = true;
    logger.info(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err: Error) => {
      logger.error(`MongoDB connection error: ${err.message}`);
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      logger.info('MongoDB reconnected');
    });
  } catch (error) {
    const err = error as Error;
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected gracefully');
};
