// database/bootstrap-db.ts
// Database Bootstrapper.
// 1. Checks if DATABASE_URL is available for cloud deployment (e.g. Neon, Supabase) and connects with SSL enabled.
// 2. Falls back to local credentials and checks/creates local database if missing.
// 3. Runs migrations in sequential order.

import fs from 'fs';
import path from 'path';
import { Client, ClientConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const PG_HOST = process.env.DATABASE_HOST || 'localhost';
const PG_PORT = process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432;
const PG_USER = process.env.DATABASE_USER || 'postgres';
const PG_PASSWORD = process.env.DATABASE_PASSWORD || 'postgres';
const TARGET_DB = process.env.DATABASE_NAME || 'photoshare';
const DB_URL = process.env.DATABASE_URL;

async function bootstrap() {
  console.log("=== PHOTO_SHARE DATABASE BOOTSTRAPPER ===");
  
  let dbClient: Client;

  if (DB_URL) {
    console.log("Connecting using DATABASE_URL...");
    const clientConfig: ClientConfig = {
      connectionString: DB_URL,
    };
    
    // Enable SSL configuration for Neon/Supabase cloud providers
    if (DB_URL.includes('sslmode=require') || DB_URL.includes('neon.tech') || DB_URL.includes('supabase.co')) {
      clientConfig.ssl = { rejectUnauthorized: false };
    }
    
    dbClient = new Client(clientConfig);
  } else {
    // Connect to default 'postgres' database locally to verify/create target database
    const initClient = new Client({
      host: PG_HOST,
      port: PG_PORT,
      user: PG_USER,
      password: PG_PASSWORD,
      database: 'postgres',
    });

    try {
      await initClient.connect();
      console.log("Connected to default 'postgres' database.");

      // Check if target database already exists
      const checkDbRes = await initClient.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [TARGET_DB]
      );

      if (checkDbRes.rows.length === 0) {
        console.log(`Database '${TARGET_DB}' not found. Creating it...`);
        await initClient.query(`CREATE DATABASE ${TARGET_DB}`);
        console.log(`Database '${TARGET_DB}' created successfully!`);
      } else {
        console.log(`Database '${TARGET_DB}' already exists.`);
      }
    } catch (err: any) {
      console.error("Failed to initialize database container:", err.message);
      process.exit(1);
    } finally {
      await initClient.end();
    }

    dbClient = new Client({
      host: PG_HOST,
      port: PG_PORT,
      user: PG_USER,
      password: PG_PASSWORD,
      database: TARGET_DB,
    });
  }

  // Connect and apply all migrations
  try {
    await dbClient.connect();
    console.log(`Connected to target database.`);

    // Get all migration files
    const migrationsDir = path.join(process.cwd(), 'database', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Migrations directory not found at: ${migrationsDir}`);
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort alphabetically to run them in order

    console.log(`Found ${migrationFiles.length} migration script(s). Running them sequentially...`);

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      console.log(`Applying migration: ${file}...`);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      await dbClient.query(sqlContent);
      console.log(`Successfully applied: ${file}`);
    }

    console.log("\n=== DATABASE BOOTSTRAP COMPLETED SUCCESSFULLY! ===");
  } catch (err: any) {
    console.error("Migration execution failed:", err.message);
    process.exit(1);
  } finally {
    await dbClient.end();
  }
}

bootstrap();
