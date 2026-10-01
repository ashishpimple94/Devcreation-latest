import mongoose from 'mongoose';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

/**
 * Connects to MongoDB. Mongoose maintains an internal connection pool, so a
 * single connect call is sufficient for the whole process.
 */
export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error', { err: err.message }));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(env.MONGODB_URI, {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10000,
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
}

/**
 * MongoDB multi-document transactions require a replica set (or mongos). A
 * standalone server — common in local dev — rejects them with
 * "Transaction numbers are only allowed on a replica set member or mongos".
 * We probe the topology once so the order flow can fall back to a
 * non-transactional path on standalone instances.
 */
let transactionsSupported: boolean | null = null;

export async function supportsTransactions(): Promise<boolean> {
  if (transactionsSupported !== null) return transactionsSupported;
  try {
    const admin = mongoose.connection.db?.admin();
    const info = await admin?.command({ hello: 1 });
    // `setName` is present on replica-set members; `msg === 'isdbgrid'` on mongos.
    transactionsSupported = Boolean(info?.setName) || info?.msg === 'isdbgrid';
  } catch {
    transactionsSupported = false;
  }
  if (!transactionsSupported) {
    logger.warn(
      'MongoDB is standalone — order checkout will run without a transaction. Use a replica set in production for atomic multi-document writes.',
    );
  }
  return transactionsSupported;
}
