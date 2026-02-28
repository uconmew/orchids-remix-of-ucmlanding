import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function addUserFields() {
  try {
    console.log('Adding phone and registrationNumber columns to user table...');
    
    // Add phone column
    await db.run(sql`ALTER TABLE user ADD COLUMN phone TEXT`);
    console.log('✓ Added phone column');
    
    // Add registrationNumber column
    await db.run(sql`ALTER TABLE user ADD COLUMN registration_number TEXT UNIQUE`);
    console.log('✓ Added registration_number column');
    
    console.log('✓ Migration completed successfully!');
  } catch (error: any) {
    if (error.message?.includes('duplicate column name')) {
      console.log('Columns already exist, skipping...');
    } else {
      console.error('Migration error:', error);
      throw error;
    }
  }
}

addUserFields().then(() => process.exit(0)).catch(() => process.exit(1));
