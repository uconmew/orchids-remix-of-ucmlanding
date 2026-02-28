import { seedPartners } from '../src/db/seeds/partners';

async function main() {
  try {
    console.log('🌱 Starting partner organizations seed...\n');
    await seedPartners();
    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
