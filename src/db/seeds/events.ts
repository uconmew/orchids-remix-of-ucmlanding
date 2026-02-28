import { db } from '@/db';
import { events } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const calculateDate = (daysOffset: number, hours: number, minutes: number): string => {
        const date = new Date(now);
        date.setDate(date.getDate() + daysOffset);
        date.setHours(hours, minutes, 0, 0);
        return date.toISOString();
    };

    const calculatePastDate = (daysAgo: number): string => {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString();
    };

    const sampleEvents = [
        {
            title: 'Financial Literacy Workshop: Budgeting Basics',
            eventType: 'workshop',
            description: 'Learn essential budgeting skills, how to track expenses, and build emergency savings. Perfect for those starting their financial recovery journey.',
            startDate: calculateDate(7, 18, 0),
            endDate: calculateDate(7, 20, 0),
            location: 'UCon Community Center - Room 101, Denver, CO',
            maxAttendees: 25,
            requiresAuth: 0,
            imageUrl: 'https://images.unsplash.com/photo-1554224311-beee4f8a089b?w=800',
            createdAt: calculatePastDate(10),
        },
        {
            title: 'Sunday Worship Service',
            eventType: 'service',
            description: 'Join us for uplifting worship, powerful preaching, and community fellowship. All are welcome!',
            startDate: calculateDate(3, 10, 0),
            endDate: calculateDate(3, 12, 0),
            location: 'UCon Ministries Main Chapel, Denver, CO',
            maxAttendees: 200,
            requiresAuth: 0,
            imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800',
            createdAt: calculatePastDate(20),
        },
        {
            title: 'Community Food Distribution Drive',
            eventType: 'outreach',
            description: 'Monthly food distribution serving families in need. Volunteers needed! Food boxes include fresh produce, proteins, and pantry staples.',
            startDate: calculateDate(12, 9, 0),
            endDate: calculateDate(12, 14, 0),
            location: 'UCon Parking Lot, 1234 Hope Street, Denver, CO',
            maxAttendees: null,
            requiresAuth: 0,
            imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
            createdAt: calculatePastDate(15),
        },
        {
            title: 'Leadership Development Institute Info Session',
            eventType: 'meeting',
            description: 'Learn about our intensive 64-week LDI program. Hear from graduates, meet staff, and discover if this transformational journey is right for you.',
            startDate: calculateDate(5, 19, 0),
            endDate: calculateDate(5, 21, 0),
            location: 'UCon Community Center - Conference Room A',
            maxAttendees: 40,
            requiresAuth: 0,
            imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
            createdAt: calculatePastDate(18),
        },
        {
            title: 'Creative Expression Workshop: Art Therapy',
            eventType: 'workshop',
            description: 'Explore healing through creativity. No art experience needed! All supplies provided. Express yourself through painting, drawing, and collage.',
            startDate: calculateDate(14, 13, 0),
            endDate: calculateDate(14, 16, 0),
            location: 'UCon Arts Studio, Community Center Building B',
            maxAttendees: 15,
            requiresAuth: 1,
            imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
            createdAt: calculatePastDate(8),
        },
        {
            title: 'Homeless Outreach & Street Ministry',
            eventType: 'outreach',
            description: 'Join our team bringing meals, supplies, and hope to our unhoused neighbors downtown. Meet at UCon and we\'ll travel together.',
            startDate: calculateDate(9, 18, 0),
            endDate: calculateDate(9, 21, 0),
            location: 'Meet at UCon Ministries Main Building',
            maxAttendees: 30,
            requiresAuth: 0,
            imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800',
            createdAt: calculatePastDate(12),
        },
        {
            title: 'Wednesday Night Bible Study',
            eventType: 'service',
            description: 'Dive deep into Scripture with our weekly Bible study. Currently studying the Book of Romans. Coffee and snacks provided.',
            startDate: calculateDate(4, 19, 0),
            endDate: calculateDate(4, 20, 30),
            location: 'UCon Community Center - Room 205',
            maxAttendees: 50,
            requiresAuth: 0,
            imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
            createdAt: calculatePastDate(60),
        },
        {
            title: 'Career Development Workshop: Interview Skills',
            eventType: 'workshop',
            description: 'Prepare for job success! Learn interview techniques, how to answer tough questions, professional dress tips, and build confidence.',
            startDate: calculateDate(18, 10, 0),
            endDate: calculateDate(18, 12, 30),
            location: 'UCon Community Center - Conference Room B',
            maxAttendees: 20,
            requiresAuth: 0,
            imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
            createdAt: calculatePastDate(7),
        },
    ];

    await db.insert(events).values(sampleEvents);
    
    console.log('✅ Events seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});