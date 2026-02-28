import { db } from '@/db';
import { workshopRegistrations, workshops, user } from '@/db/schema';

async function main() {
    // Query existing workshops and users
    const existingWorkshops = await db.select({ id: workshops.id }).from(workshops);
    const existingUsers = await db.select({ 
        id: user.id, 
        name: user.name, 
        email: user.email 
    }).from(user).limit(10);

    if (existingWorkshops.length === 0) {
        console.log('⚠️  No workshops found. Please run workshops seeder first.');
        return;
    }

    if (existingUsers.length === 0) {
        console.log('⚠️  No users found. Please run users seeder first.');
        return;
    }

    const workshopIds = existingWorkshops.map(w => w.id);
    const users = existingUsers;

    const noteOptions = [
        "Looking forward to learning practical skills",
        "This topic is exactly what I need right now",
        "Will this workshop provide certificate of completion?",
        "Can't wait to apply these principles",
        "Grateful for this opportunity",
        "Hoping to gain clarity on next steps",
        "Excited to connect with others on similar journey",
        "Praying this will help me move forward",
        "Been waiting for a workshop like this",
        "Ready to take the next step in my healing",
    ];

    const getRandomNote = () => {
        return Math.random() > 0.7 ? noteOptions[Math.floor(Math.random() * noteOptions.length)] : null;
    };

    const getRandomUser = () => {
        return users[Math.floor(Math.random() * users.length)];
    };

    const getDaysAgo = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString();
    };

    const getMinutesAfter = (baseDate: string, minutes: number) => {
        const date = new Date(baseDate);
        date.setMinutes(date.getMinutes() + minutes);
        return date.toISOString();
    };

    const now = new Date();
    const workshopDates = {
        1: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days away
        2: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days away
        3: now.toISOString(), // Live now
        4: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days away
        5: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days away
        6: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        7: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days away
        8: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days away
    };

    const sampleRegistrations = [];

    // Workshop 1: Leadership (3 days away) - 12 registrations
    for (let i = 0; i < 12; i++) {
        const randomUser = getRandomUser();
        sampleRegistrations.push({
            workshopId: workshopIds[0],
            userId: randomUser.id,
            userName: randomUser.name,
            userEmail: randomUser.email,
            status: 'registered',
            notes: getRandomNote(),
            registeredAt: getDaysAgo(Math.floor(Math.random() * 7) + 4),
            attendedAt: null,
        });
    }

    // Workshop 2: Trauma Recovery (5 days away) - 8 registrations
    for (let i = 0; i < 8; i++) {
        const randomUser = getRandomUser();
        sampleRegistrations.push({
            workshopId: workshopIds[1],
            userId: randomUser.id,
            userName: randomUser.name,
            userEmail: randomUser.email,
            status: 'registered',
            notes: getRandomNote(),
            registeredAt: getDaysAgo(Math.floor(Math.random() * 8) + 6),
            attendedAt: null,
        });
    }

    // Workshop 3: Biblical Studies (LIVE now) - 10 registrations (8 attended, 2 registered)
    for (let i = 0; i < 8; i++) {
        const randomUser = getRandomUser();
        sampleRegistrations.push({
            workshopId: workshopIds[2],
            userId: randomUser.id,
            userName: randomUser.name,
            userEmail: randomUser.email,
            status: 'attended',
            notes: getRandomNote(),
            registeredAt: getDaysAgo(Math.floor(Math.random() * 5) + 1),
            attendedAt: getMinutesAfter(workshopDates[3], Math.floor(Math.random() * 6) + 5),
        });
    }
    for (let i = 0; i < 2; i++) {
        const randomUser = getRandomUser();
        sampleRegistrations.push({
            workshopId: workshopIds[2],
            userId: randomUser.id,
            userName: randomUser.name,
            userEmail: randomUser.email,
            status: 'registered',
            notes: getRandomNote(),
            registeredAt: getDaysAgo(Math.floor(Math.random() * 3) + 1),
            attendedAt: null,
        });
    }

    // Workshop 4: Life Skills (7 days away) - 15 registrations
    for (let i = 0; i < 15; i++) {
        const randomUser = getRandomUser();
        sampleRegistrations.push({
            workshopId: workshopIds[3],
            userId: randomUser.id,
            userName: randomUser.name,
            userEmail: randomUser.email,
            status: 'registered',
            notes: getRandomNote(),
            registeredAt: getDaysAgo(Math.floor(Math.random() * 9) + 8),
            attendedAt: null,
        });
    }

    // Workshop 5: Career (10 days away) - 6 registrations
    for (let i = 0; i < 6; i++) {
        const randomUser = getRandomUser();
        sampleRegistrations.push({
            workshopId: workshopIds[4],
            userId: randomUser.id,
            userName: randomUser.name,
            userEmail: randomUser.email,
            status: 'registered',
            notes: getRandomNote(),
            registeredAt: getDaysAgo(Math.floor(Math.random() * 10) + 11),
            attendedAt: null,
        });
    }

    // Workshop 6: Family Restoration (completed yesterday) - 18 registrations (15 attended, 2 no-show, 1 cancelled)
    for (let i = 0; i < 15; i++) {
        const randomUser = getRandomUser();
        sampleRegistrations.push({
            workshopId: workshopIds[5],
            userId: randomUser.id,
            userName: randomUser.name,
            userEmail: randomUser.email,
            status: 'attended',
            notes: getRandomNote(),
            registeredAt: getDaysAgo(Math.floor(Math.random() * 7) + 2),
            attendedAt: getMinutesAfter(workshopDates[6], Math.floor(Math.random() * 6) + 5),
        });
    }
    for (let i = 0; i < 2; i++) {
        const randomUser = getRandomUser();
        sampleRegistrations.push({
            workshopId: workshopIds[5],
            userId: randomUser.id,
            userName: randomUser.name,
            userEmail: randomUser.email,
            status: 'no-show',
            notes: null,
            registeredAt: getDaysAgo(Math.floor(Math.random() * 5) + 2),
            attendedAt: null,
        });
    }
    const randomUser = getRandomUser();
    sampleRegistrations.push({
        workshopId: workshopIds[5],
        userId: randomUser.id,
        userName: randomUser.name,
        userEmail: randomUser.email,
        status: 'cancelled',
        notes: 'Had an emergency, will register for next one',
        registeredAt: getDaysAgo(4),
        attendedAt: null,
    });

    // Workshop 7: Substance Recovery (12 days away) - 10 registrations
    for (let i = 0; i < 10; i++) {
        const randomUser = getRandomUser();
        sampleRegistrations.push({
            workshopId: workshopIds[6],
            userId: randomUser.id,
            userName: randomUser.name,
            userEmail: randomUser.email,
            status: 'registered',
            notes: getRandomNote(),
            registeredAt: getDaysAgo(Math.floor(Math.random() * 12) + 13),
            attendedAt: null,
        });
    }

    // Workshop 8: Community Service (14 days away) - 5 registrations
    for (let i = 0; i < 5; i++) {
        const randomUser = getRandomUser();
        sampleRegistrations.push({
            workshopId: workshopIds[7],
            userId: randomUser.id,
            userName: randomUser.name,
            userEmail: randomUser.email,
            status: 'registered',
            notes: getRandomNote(),
            registeredAt: getDaysAgo(Math.floor(Math.random() * 14) + 15),
            attendedAt: null,
        });
    }

    await db.insert(workshopRegistrations).values(sampleRegistrations);
    
    console.log('✅ Workshop registrations seeder completed successfully');
    console.log(`   Generated ${sampleRegistrations.length} registrations across ${workshopIds.length} workshops`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});