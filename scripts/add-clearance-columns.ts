/**
 * Add Clearance Columns to user_roles table
 * 
 * Usage:
 *   bun run scripts/add-clearance-columns.ts
 */

import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function addClearanceColumns() {
  console.log('🔧 Adding clearance columns to user_roles table...\n');

  try {
    // Check if columns already exist
    const tableInfo = await db.run(sql`PRAGMA table_info(user_roles)`);
    console.log('Current user_roles table structure:');
    console.log(tableInfo);
    
    // Add permission_clearance column if it doesn't exist
    try {
      await db.run(sql`ALTER TABLE user_roles ADD COLUMN permission_clearance INTEGER DEFAULT 0`);
      console.log('✅ Added permission_clearance column');
    } catch (error: any) {
      if (error.message.includes('duplicate column name')) {
        console.log('ℹ️  permission_clearance column already exists');
      } else {
        throw error;
      }
    }

    // Add duty_clearance column if it doesn't exist
    try {
      await db.run(sql`ALTER TABLE user_roles ADD COLUMN duty_clearance INTEGER DEFAULT 0`);
      console.log('✅ Added duty_clearance column');
    } catch (error: any) {
      if (error.message.includes('duplicate column name')) {
        console.log('ℹ️  duty_clearance column already exists');
      } else {
        throw error;
      }
    }

    console.log('\n✅ SUCCESS! Clearance columns added to user_roles table');
    console.log('\n📋 New columns:');
    console.log('  • permission_clearance (INTEGER, default: 0)');
    console.log('  • duty_clearance (INTEGER, default: 0)');
    console.log('\nYou can now run: bun run scripts/upgrade-admin-to-full-access.ts\n');

  } catch (error) {
    console.error('❌ FAILED to add clearance columns');
    console.error('   Error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Run the script
addClearanceColumns();
