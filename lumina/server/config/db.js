import mongoose from 'mongoose';
import dns from 'node:dns';
import logger from '../utils/logger.js';

let listenersAttached = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured');

  const dnsServers = process.env.MONGODB_DNS_SERVERS || '';
  if (dnsServers) {
    dns.setServers(dnsServers.split(',').map((server) => server.trim()).filter(Boolean));
  }

  mongoose.set('strictQuery', true);

  if (!listenersAttached) {
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connection established', { host: mongoose.connection.host });
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected - driver will attempt reconnect');
    });

    listenersAttached = true;
  }

  await mongoose.connect(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true
  });
};

export default connectDB;
