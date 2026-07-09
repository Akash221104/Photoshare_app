// database/db.ts
// Singleton PostgreSQL connection pool using the 'pg' package.
// Configured to handle dev hot-reloads and support robust transactional queries.

import { Pool, PoolConfig } from 'pg';

// Global declaration to prevent leaking pools during hot reloads in Next.js development mode.
declare global {
  var pgPool: Pool | undefined;
}

const getPool = (): Pool => {
  const isProduction = process.env.NODE_ENV === 'production';

  const config: PoolConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DATABASE_HOST || 'localhost',
        port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'photoshare',
      };

  const isCloudDb = !!(
    process.env.DATABASE_URL?.includes('sslmode=require') ||
    process.env.DATABASE_URL?.includes('neon.tech') ||
    process.env.DATABASE_URL?.includes('supabase.co') ||
    process.env.DATABASE_HOST?.includes('neon.tech') ||
    process.env.DATABASE_HOST?.includes('supabase.co')
  );

  const poolOptions: PoolConfig = {
    ...config,
    max: process.env.DATABASE_MAX_CONNECTIONS 
      ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10) 
      : (isProduction ? 20 : 5),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: isCloudDb ? { rejectUnauthorized: false } : undefined,
  };



  if (isProduction) {
    const pool = new Pool(poolOptions);
    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle PostgreSQL client in production:', err);
    });
    return pool;
  }

  // Development / Test connection pool persistence
  if (!global.pgPool) {
    global.pgPool = new Pool(poolOptions);
    global.pgPool.on('error', (err: Error) => {
      console.error('Unexpected error on idle PostgreSQL client in development:', err);
    });
  }

  return global.pgPool;
};

// Export the singleton pool instance
export const dbPool = getPool();

/**
 * Standard parameterized query runner.
 * Handles performance timing and automated error logging.
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await dbPool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed Query:', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query execution failure:', { text, error });
    throw error;
  }
};

/**
 * Retrieves a single client connection from the pool.
 * MUST be used to execute queries in an explicit TRANSACTION block.
 * Remember to call `client.release()` in a `finally` block when done.
 */
export const getClient = async () => {
  const client = await dbPool.connect();
  return client;
};
