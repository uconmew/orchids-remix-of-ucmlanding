import { db } from '../src/db';
import { prayers } from '../src/db/schema';
import { sql } from 'drizzle-orm';

async function resetPrayerCounts() {
  console.log('Fetching all prayers...');
  
  const allPrayers = await db.select().from(prayers);
  console.log(`Found ${allPrayers.length} prayers`);
  
  console.log('Resetting prayer counts to realistic values...');
  
  for (const prayer of allPrayers) {
    // Generate random prayer count between 1-30, weighted toward lower numbers
    const randomCount = Math.floor(Math.random() * 30) + 1;
    
    await db
      .update(prayers)
      .set({ prayCount: randomCount })
      .where(sql`${prayers.id} = ${prayer.id}`);
  }
  
  // Calculate new total
  const stats = await db
    .select({
      total: sql<number>`sum(${prayers.prayCount})`,
      count: sql<number>`count(*)`
    })
    .from(prayers);
    
  console.log(`✓ Reset complete!`);
  console.log(`  Total prayers: ${stats[0]?.count || 0}`);
  console.log(`  Total pray count: ${stats[0]?.total || 0}`);
  console.log(`  Average: ${(Number(stats[0]?.total || 0) / Number(stats[0]?.count || 1)).toFixed(1)} prayers per request`);
  
  process.exit(0);
}

resetPrayerCounts().catch((error) => {
  console.error('Error resetting prayer counts:', error);
  process.exit(1);
});
