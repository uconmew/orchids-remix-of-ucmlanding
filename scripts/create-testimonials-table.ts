import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sql } from "drizzle-orm";

const url = process.env.TURSO_CONNECTION_URL || process.env.DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  authToken: authToken || undefined,
});

const db = drizzle(client);

async function createTable() {
  try {
    console.log("Connecting to:", url);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        image TEXT,
        quote TEXT NOT NULL,
        badge TEXT,
        rating INTEGER DEFAULT 5,
        is_published INTEGER DEFAULT 0,
        is_featured INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    console.log("Testimonials table created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

createTable();
