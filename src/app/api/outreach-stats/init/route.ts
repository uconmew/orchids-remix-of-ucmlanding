import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS outreach_service_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id TEXT NOT NULL UNIQUE,
        stat1_label TEXT NOT NULL,
        stat1_value INTEGER NOT NULL DEFAULT 0,
        stat2_label TEXT NOT NULL,
        stat2_value INTEGER NOT NULL DEFAULT 0,
        stat3_label TEXT NOT NULL,
        stat3_value INTEGER NOT NULL DEFAULT 0,
        stat4_label TEXT NOT NULL,
        stat4_value INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS transit_activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        driver_id TEXT,
        driver_name TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        ride_type TEXT NOT NULL,
        pickup_location TEXT,
        dropoff_location TEXT,
        hours_served INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        created_at TEXT NOT NULL
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS nourish_activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        volunteer_id TEXT,
        volunteer_name TEXT NOT NULL,
        distribution_type TEXT NOT NULL,
        families_served INTEGER NOT NULL DEFAULT 1,
        meals_distributed INTEGER NOT NULL DEFAULT 0,
        pounds_distributed INTEGER NOT NULL DEFAULT 0,
        hours_served INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        created_at TEXT NOT NULL
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS neighbors_activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organizer_id TEXT,
        organizer_name TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_name TEXT NOT NULL,
        volunteers_engaged INTEGER NOT NULL DEFAULT 1,
        people_reached INTEGER NOT NULL DEFAULT 0,
        hours_served INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        created_at TEXT NOT NULL
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS voice_activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        advocate_id TEXT,
        advocate_name TEXT NOT NULL,
        advocacy_type TEXT NOT NULL,
        case_name TEXT,
        rights_protected INTEGER NOT NULL DEFAULT 0,
        meetings_held INTEGER NOT NULL DEFAULT 0,
        hours_served INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        created_at TEXT NOT NULL
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS haven_activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id TEXT,
        staff_name TEXT NOT NULL,
        assistance_type TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        sheltered_count INTEGER NOT NULL DEFAULT 0,
        housed_permanently INTEGER NOT NULL DEFAULT 0,
        vouchers_secured INTEGER NOT NULL DEFAULT 0,
        hours_served INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        created_at TEXT NOT NULL
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS steps_activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id TEXT,
        staff_name TEXT NOT NULL,
        support_type TEXT NOT NULL,
        recipient_name TEXT,
        crisis_calls INTEGER NOT NULL DEFAULT 0,
        rehab_placements INTEGER NOT NULL DEFAULT 0,
        recovery_support_sessions INTEGER NOT NULL DEFAULT 0,
        hours_served INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        created_at TEXT NOT NULL
      )
    `);

    const now = new Date().toISOString();
    const services = [
      // Outreach Services (Track 3)
      { id: 'transit', stat1Label: 'Rides Monthly', stat2Label: 'Jobs Secured', stat3Label: 'Appointments', stat4Label: 'Hours Served' },
      { id: 'nourish', stat1Label: 'Meals Weekly', stat2Label: 'Families Served', stat3Label: 'Pantry Visits', stat4Label: 'Pounds Distributed' },
      { id: 'neighbors', stat1Label: 'Events Monthly', stat2Label: 'Volunteers', stat3Label: 'Partners', stat4Label: 'People Reached' },
      { id: 'voice', stat1Label: 'Cases Advocated', stat2Label: 'Policy Meetings', stat3Label: 'Rights Protected', stat4Label: 'Hours Served' },
      { id: 'haven', stat1Label: 'Sheltered Monthly', stat2Label: 'Housed Permanently', stat3Label: 'Vouchers Secured', stat4Label: 'Hours Served' },
      { id: 'steps', stat1Label: 'Crisis Calls', stat2Label: 'Rehab Placements', stat3Label: 'Recovery Support', stat4Label: 'Hours Served' },
      // Open Services (Track 2)
      { id: 'equip', stat1Label: 'Workshops Monthly', stat2Label: 'Participants', stat3Label: 'Skills Taught', stat4Label: 'Hours Served' },
      { id: 'awaken', stat1Label: 'Bible Studies', stat2Label: 'Participants', stat3Label: 'Topics Covered', stat4Label: 'Hours Served' },
      { id: 'shepherd', stat1Label: 'Counseling Sessions', stat2Label: 'Prayer Requests', stat3Label: 'Crisis Calls', stat4Label: 'Hours Served' },
      { id: 'bridge', stat1Label: 'Active Mentors', stat2Label: 'Mentees', stat3Label: 'Support Groups', stat4Label: 'Hours Served' }
    ];

    for (const service of services) {
      await db.run(sql`
        INSERT OR IGNORE INTO outreach_service_stats 
        (service_id, stat1_label, stat1_value, stat2_label, stat2_value, stat3_label, stat3_value, stat4_label, stat4_value, created_at, updated_at)
        VALUES (${service.id}, ${service.stat1Label}, 0, ${service.stat2Label}, 0, ${service.stat3Label}, 0, ${service.stat4Label}, 0, ${now}, ${now})
      `);
    }

    return NextResponse.json({ success: true, message: 'Tables created and initialized' });
  } catch (error) {
    console.error('Error initializing outreach tables:', error);
    return NextResponse.json({ error: 'Failed to initialize tables', details: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'POST to this endpoint to initialize outreach tables' });
}
