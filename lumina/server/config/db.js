import mongoose from 'mongoose';
import dns from 'node:dns';
import logger from '../utils/logger.js';

const connectionOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};

let reconnectTimer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is not configured');
    }
    logger.warn('MONGODB_URI missing; using in-memory development store.');
    return false;
  }

  mongoose.set('strictQuery', true);

  const dnsServers = process.env.MONGODB_DNS_SERVERS
    || (process.platform === 'win32' && process.env.NODE_ENV !== 'production' ? '8.8.8.8,1.1.1.1' : '');
  if (dnsServers) {
    dns.setServers(dnsServers.split(',').map((server) => server.trim()).filter(Boolean));
  }

  mongoose.connection.on('connected', () => {
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  });

  mongoose.connection.on('error', (error) => {
    logger.error(`MongoDB connection error: ${error.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Reconnect will be attempted by the driver.');
    if (reconnectTimer || process.env.NODE_ENV === 'production') return;
    reconnectTimer = setTimeout(async () => {
      reconnectTimer = null;
      try {
        await mongoose.connect(uri, connectionOptions);
      } catch (error) {
        logger.error(`MongoDB reconnect failed: ${error.message}`);
      }
    }, 5000);
  });

  await mongoose.connect(uri, connectionOptions);
  return true;
};

export default connectDB;
