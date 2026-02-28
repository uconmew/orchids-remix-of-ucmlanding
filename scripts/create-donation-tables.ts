import { createClient } from '@libsql/client';
import 'dotenv/config';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function createDonationTables() {
  console.log('Creating donation tables...');

  await client.execute(`CREATE TABLE IF NOT EXISTS stripe_customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    name TEXT,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    donor_email TEXT NOT NULL,
    donor_name TEXT,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    donation_type TEXT NOT NULL,
    tier TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    is_anonymous INTEGER DEFAULT 0,
    message TEXT,
    tax_receipt_sent INTEGER DEFAULT 0,
    tax_receipt_url TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS donation_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stripe_subscription_id TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT NOT NULL,
    stripe_price_id TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    donor_name TEXT,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    interval TEXT NOT NULL,
    tier TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    is_anonymous INTEGER DEFAULT 0,
    current_period_start TEXT,
    current_period_end TEXT,
    cancel_at_period_end INTEGER DEFAULT 0,
    canceled_at TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  console.log('Donation tables created successfully!');
}

createDonationTables()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error creating tables:', err);
    process.exit(1);
  });
