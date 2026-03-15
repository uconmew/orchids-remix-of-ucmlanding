#!/usr/bin/env tsx
// scripts/1-add-transit-suspensions.ts
// Run: npx tsx scripts/1-add-transit-suspensions.ts

import { config } from 'dotenv';
config();

import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function run() {
  console.log('🔧 Adding transit_suspensions table...\n');

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS transit_suspensions (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        suspended_by TEXT REFERENCES "user"(id),
        reason TEXT NOT NULL,
        suspended_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        lifted_at TEXT,
        lifted_by TEXT REFERENCES "user"(id),
        lift_reason TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    console.log('✅ transit_suspensions table created');

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_transit_suspensions_user_id
      ON transit_suspensions(user_id)
    `);
    console.log('✅ Index created');

    console.log('\n📋 Now add this to src/db/schema.ts after the transitBookings block:\n');
    console.log(`export const transitSuspensions = pgTable('transit_suspensions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  suspendedBy: text('suspended_by').references(() => user.id),
  reason: text('reason').notNull(),
  suspendedAt: text('suspended_at').notNull(),
  expiresAt: text('expires_at').notNull(),
  liftedAt: text('lifted_at'),
  liftedBy: text('lifted_by').references(() => user.id),
  liftReason: text('lift_reason'),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});`);
    console.log('\n✅ Migration complete. Add the schema above, then run script 2.');
  } catch (err: any) {
    if (err.message?.includes('already exists')) {
      console.log('⏭️  Table already exists — skipping');
    } else {
      console.error('❌ Failed:', err.message);
      process.exit(1);
    }
  }
}

run();
