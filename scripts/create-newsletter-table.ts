import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function createNewsletterTable() {
  try {
    console.log('Creating newsletter_subscribers table...');
    
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'active',
        subscribed_at TEXT NOT NULL,
        unsubscribed_at TEXT,
        source TEXT DEFAULT 'homepage_modal',
        tags TEXT,
        last_email_sent TEXT,
        emails_sent INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    
    console.log('✓ Table created successfully!');
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
}

createNewsletterTable()
  .then(() => {
    console.log('Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
