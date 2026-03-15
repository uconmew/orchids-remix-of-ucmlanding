#!/usr/bin/env tsx
/**
 * Migration Script: Remove Foreign Key Constraint from workshop_participants.user_id
 * 
 * This script fixes the FOREIGN KEY constraint on workshopParticipants.userId
 * that prevents guest users from joining workshops.
 * 
 * Run with: npx tsx scripts/fix-workshop-participants-fk.ts
 */

// Load environment variables first
import { config } from 'dotenv';
config();

import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function fixWorkshopParticipantsForeignKey() {
  console.log('🔧 Starting migration to fix workshop_participants foreign key constraint...\n');

  try {
    // Step 1: Check current schema
    console.log('📋 Checking current schema...');
    const tableInfo = await db.all(sql`PRAGMA table_info(workshop_participants)`);
    console.log('Current columns:', tableInfo);

    const foreignKeys = await db.all(sql`PRAGMA foreign_key_list(workshop_participants)`);
    console.log('Current foreign keys:', foreignKeys);

    if (foreignKeys.length === 0) {
      console.log('✅ No foreign key constraints found. Schema is already correct!');
      return;
    }

    // Step 2: Disable foreign key constraints temporarily
    console.log('\n🔓 Disabling foreign key constraints...');
    await db.run(sql`PRAGMA foreign_keys = OFF`);

    // Step 3: Create backup of existing data
    console.log('💾 Backing up existing data...');
    const existingData = await db.all(sql`SELECT * FROM workshop_participants`);
    console.log(`Backed up ${existingData.length} participant records`);

    // Step 4: Rename old table
    console.log('\n🔄 Renaming old table...');
    await db.run(sql`ALTER TABLE workshop_participants RENAME TO workshop_participants_old`);

    // Step 5: Create new table without foreign key on user_id
    console.log('🆕 Creating new table without foreign key constraint...');
    await db.run(sql`
      CREATE TABLE workshop_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workshop_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        peer_id TEXT,
        is_host INTEGER DEFAULT 0,
        is_muted INTEGER DEFAULT 0,
        is_video_off INTEGER DEFAULT 0,
        joined_at TEXT NOT NULL,
        left_at TEXT,
        FOREIGN KEY (workshop_id) REFERENCES workshops(id)
      )
    `);

    // Step 6: Copy data from old table to new table
    console.log('📦 Copying data to new table...');
    await db.run(sql`
      INSERT INTO workshop_participants 
      SELECT * FROM workshop_participants_old
    `);

    // Step 7: Verify data migration
    const newData = await db.all(sql`SELECT * FROM workshop_participants`);
    console.log(`✅ Migrated ${newData.length} records`);

    if (existingData.length !== newData.length) {
      throw new Error(`Data mismatch! Original: ${existingData.length}, New: ${newData.length}`);
    }

    // Step 8: Drop old table
    console.log('\n🗑️  Dropping old table...');
    await db.run(sql`DROP TABLE workshop_participants_old`);

    // Step 9: Re-enable foreign key constraints
    console.log('🔒 Re-enabling foreign key constraints...');
    await db.run(sql`PRAGMA foreign_keys = ON`);

    // Step 10: Verify schema
    console.log('\n✨ Verifying new schema...');
    const newForeignKeys = await db.all(sql`PRAGMA foreign_key_list(workshop_participants)`);
    console.log('New foreign keys:', newForeignKeys);

    const userIdFkExists = newForeignKeys.some((fk: any) => fk.from === 'user_id');
    if (userIdFkExists) {
      throw new Error('Foreign key on user_id still exists after migration!');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('✅ Guest users can now join workshops without foreign key constraints.');
    console.log('✅ The workshop_id foreign key is still intact for data integrity.\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    
    // Attempt to restore if migration failed
    try {
      console.log('\n🔄 Attempting to restore from backup...');
      await db.run(sql`DROP TABLE IF EXISTS workshop_participants`);
      await db.run(sql`ALTER TABLE workshop_participants_old RENAME TO workshop_participants`);
      await db.run(sql`PRAGMA foreign_keys = ON`);
      console.log('✅ Restored to previous state');
    } catch (restoreError) {
      console.error('❌ Failed to restore:', restoreError);
      console.error('⚠️  MANUAL INTERVENTION REQUIRED!');
    }

    throw error;
  }
}

// Run migration
fixWorkshopParticipantsForeignKey()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });