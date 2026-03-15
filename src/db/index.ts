import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Use a singleton pattern for the database connection to prevent pool exhaustion in Next.js dev mode
const globalForDb = global as unknown as {
  client: postgres.Sql | undefined;
};

const connectionString = process.env.DATABASE_URL!;

// In serverless environments, we want to limit the number of connections
// For Supabase, if using the transaction pooler, we should use max: 1 or 10 depending on scale
const client = globalForDb.client ?? postgres(connectionString, { 
  max: process.env.NODE_ENV === 'development' ? 5 : 10,
  prepare: false // Required for Supabase transaction pooler
});

if (process.env.NODE_ENV !== 'production') globalForDb.client = client;

export const db = drizzle(client, { schema });

export type Database = typeof db;
