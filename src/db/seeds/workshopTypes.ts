import { db } from '@/db';
import { workshopTypes } from '@/db/schema';

async function main() {
    const sampleWorkshopTypes = [
        {
            name: 'EQUIP',
            description: 'Life skills, personal development, progression, and growth workshops focused on practical transformation',
            category: 'equip',
            defaultMaxParticipants: 20,
            defaultDuration: 90,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'AWAKEN',
            description: 'Biblical, spiritual, and Christian faith-based workshops focused on spiritual transformation',
            category: 'awaken',
            defaultMaxParticipants: 30,
            defaultDuration: 90,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(workshopTypes).values(sampleWorkshopTypes);
    
    console.log('✅ Workshop types seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});