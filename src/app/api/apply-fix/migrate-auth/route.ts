import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    // Create individual_permissions table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS individual_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
        resource TEXT NOT NULL,
        action TEXT NOT NULL,
        is_granted INTEGER DEFAULT 1,
        granted_by TEXT REFERENCES user(id),
        granted_at TEXT NOT NULL,
        expires_at TEXT
      )
    `);

    // Create convict_permissions table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS convict_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        convict_id INTEGER NOT NULL REFERENCES convicts(id) ON DELETE CASCADE,
        resource TEXT NOT NULL,
        action TEXT NOT NULL,
        is_granted INTEGER DEFAULT 1,
        granted_by TEXT REFERENCES user(id),
        granted_at TEXT NOT NULL,
        expires_at TEXT
      )
    `);

    // Add clearance columns to convicts table if they don't exist
    try {
      await db.run(sql`ALTER TABLE convicts ADD COLUMN clearance_level INTEGER DEFAULT 0`);
    } catch (e) {
      // Column might already exist
    }

    try {
      await db.run(sql`ALTER TABLE convicts ADD COLUMN duty_clearance INTEGER DEFAULT 0`);
    } catch (e) {
      // Column might already exist
    }

    return NextResponse.json({ 
      success: true, 
      message: "Authorization tables created successfully" 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed: ' + (error as Error).message 
    }, { status: 500 });
  }
}
