import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Create volunteer_stats table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS volunteer_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        active_volunteers INTEGER NOT NULL DEFAULT 0,
        hours_donated INTEGER NOT NULL DEFAULT 0,
        partner_churches INTEGER NOT NULL DEFAULT 0,
        last_updated TEXT NOT NULL
      )
    `);

    // Insert initial data if table is empty
    await db.run(sql`
      INSERT INTO volunteer_stats (active_volunteers, hours_donated, partner_churches, last_updated) 
      SELECT 250, 5000, 45, datetime('now')
      WHERE NOT EXISTS (SELECT 1 FROM volunteer_stats)
    `);

    // Create volunteer_time_entries table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS volunteer_time_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        volunteer_id TEXT NOT NULL,
        volunteer_name TEXT NOT NULL,
        clock_in TEXT NOT NULL,
        clock_out TEXT,
        total_hours REAL,
        activity_type TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create indexes
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_volunteer_time_entries_volunteer_id ON volunteer_time_entries(volunteer_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_volunteer_time_entries_clock_in ON volunteer_time_entries(clock_in)`);

    return NextResponse.json({ 
      success: true, 
      message: 'Volunteer stats migration completed successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        error: 'Migration failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}
