import dns from 'dns';
import mongoose from 'mongoose';

// Configure DNS for MongoDB Atlas SRV records on Windows/local networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
  if (typeof (dns as any).setDefaultResultOrder === 'function') {
    (dns as any).setDefaultResultOrder('ipv4first');
  }
} catch (dnsErr) {
  console.warn('[DNS] Warning setting DNS servers:', dnsErr);
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

async function resolveAtlasSrvFallback(uri: string): Promise<string | null> {
  try {
    const match = uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(\/[^?]+)?(\?.*)?$/);
    if (!match) return null;

    const [, user, pass, host, path = '/forrabix', query = ''] = match;
    const srvName = `_mongodb._tcp.${host}`;

    const resolver = new dns.promises.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);
    const records = await resolver.resolveSrv(srvName);

    if (!records || records.length === 0) return null;

    const hosts = records.map(r => `${r.name}:${r.port}`).join(',');
    const queryParams = new URLSearchParams(query.startsWith('?') ? query.substring(1) : query);
    queryParams.set('ssl', 'true');
    if (!queryParams.has('authSource')) {
      queryParams.set('authSource', 'admin');
    }

    // Do not force a replicaSet query parameter unless explicitly set in original URI.
    // MongoDB driver will auto-discover the cluster replica set name from seedlist hosts.

    return `mongodb://${user}:${pass}@${hosts}${path}?${queryParams.toString()}`;
  } catch (err: any) {
    console.warn('[MONGODB] SRV resolution fallback failed:', err?.message || err);
    return null;
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
  }

  // If already connected and connection is ready, reuse it
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB_NAME || undefined,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    };

    cached.promise = (async () => {
      // Re-apply DNS config prior to connection attempt
      try {
        dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
      } catch {}

      try {
        const instance = await mongoose.connect(uri, opts);
        const host = instance.connection.host || 'unknown-host';
        const dbName = instance.connection.name || 'unknown-db';
        console.log(`[MONGODB] Connected successfully to host: "${host}", database: "${dbName}"`);
        return instance;
      } catch (firstErr: any) {
        console.warn(`[MONGODB] Primary SRV connection failed (${firstErr?.message || firstErr}). Attempting DNS resolution fallback...`);
        const fallbackUri = await resolveAtlasSrvFallback(uri);
        if (fallbackUri) {
          const fallbackInstance = await mongoose.connect(fallbackUri, opts);
          const host = fallbackInstance.connection.host || 'unknown-host';
          const dbName = fallbackInstance.connection.name || 'unknown-db';
          console.log(`[MONGODB] Connected successfully via seedlist fallback to host: "${host}", database: "${dbName}"`);
          return fallbackInstance;
        }
        throw firstErr;
      }
    })().catch((err) => {
      console.error('[MONGODB] Connection error:', err.message || err);
      cached.promise = null;
      cached.conn = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
