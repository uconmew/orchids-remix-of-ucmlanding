import { db } from '@/db';
import { roles } from '@/db/schema';

async function main() {
    await db.delete(roles);
    
    const ucmStaffLevels = [
        {
            name: 'Executive Leadership',
            level: 1,
            description: 'Founding Visionary Lead with executive decision-making authority',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Program Directors',
            level: 2,
            description: 'Clinical Director, Spiritual Formation Director, Programs Director with strategic oversight',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Ministry Coordinators',
            level: 3,
            description: 'Outreach Coordinator and operational management staff',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Staff Members',
            level: 4,
            description: 'General staff with specific employment titles and program support roles',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Volunteers',
            level: 5,
            description: 'Basic access for volunteers participating in ministry activities',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Mentors',
            level: 6,
            description: 'LDI graduates who mentor Convicts through their transformation journey',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Convicts',
            level: 7,
            description: 'Registered community members - base level for all self-registrations',
            createdAt: new Date('2024-01-01').toISOString(),
        }
    ];

    await db.insert(roles).values(ucmStaffLevels);
    
    console.log(`✅ UCM Staff Levels seeder completed successfully - ${ucmStaffLevels.length} levels created (1-7)`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});