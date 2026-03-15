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
      CREATE TABLE IF NOT EXISTS partner_organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        logo_url TEXT,
        website_url TEXT,
        contact_name TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        partnership_type TEXT,
        services_provided TEXT,
        is_active INTEGER DEFAULT 1,
        is_featured INTEGER DEFAULT 0,
        partnership_start_date TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    console.log("Partner organizations table created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

createTable();
