import { db } from '../src/db/index';
import { sql } from 'drizzle-orm';

async function checkTables() {
  console.log('🔍 Checking database tables...\n');

  try {
    // List all tables
    const tables = await db.all(sql`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name;
    `);

    console.log('📋 Existing tables:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.name}`);
    });

    // Check if partner_organizations exists
    const hasPartnersTable = tables.some((t: any) => t.name === 'partner_organizations');
    
    if (hasPartnersTable) {
      console.log('\n✅ partner_organizations table exists');
      
      // Count partners
      const count = await db.get(sql`SELECT COUNT(*) as count FROM partner_organizations`);
      console.log(`   Total partners: ${(count as any).count}`);
    } else {
      console.log('\n❌ partner_organizations table does NOT exist');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

checkTables();
