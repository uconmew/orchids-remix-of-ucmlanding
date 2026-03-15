import { db } from '@/db';
import { bibleStudies } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();
    
    const sampleBibleStudies = [
        {
            title: 'Monday Evening Study',
            subtitle: 'Foundational Christianity',
            dayOfWeek: 'monday',
            startTime: '19:00',
            endTime: '20:30',
            targetAudience: 'All levels welcome',
            description: 'Perfect for beginners or those returning to faith. Explore core Christian beliefs and biblical foundations in a welcoming, non-judgmental environment.',
            programType: 'awaken',
            isRecurring: 1,
            isActive: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Tuesday Morning Group',
            subtitle: "Women's Bible Study",
            dayOfWeek: 'tuesday',
            startTime: '10:00',
            endTime: '11:30',
            targetAudience: 'Women only',
            description: 'A supportive space for women to study scripture, share experiences, and build authentic community together.',
            programType: 'awaken',
            isRecurring: 1,
            isActive: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Thursday Men\'s Study',
            subtitle: 'Men of Purpose',
            dayOfWeek: 'thursday',
            startTime: '18:30',
            endTime: '20:00',
            targetAudience: 'Men only',
            description: 'Men supporting men in faith, leadership, and life challenges. Honest discussion in a safe environment where transparency is encouraged.',
            programType: 'awaken',
            isRecurring: 1,
            isActive: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Friday Fellowship',
            subtitle: 'Topical Studies',
            dayOfWeek: 'friday',
            startTime: '19:00',
            endTime: '21:00',
            targetAudience: 'Intermediate+',
            description: 'Deep dives into specific biblical topics, themes, and books. Engaging theological discussions for those with foundational biblical knowledge.',
            programType: 'awaken',
            isRecurring: 1,
            isActive: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Sunday Morning',
            subtitle: 'Community Worship & Study',
            dayOfWeek: 'sunday',
            startTime: '10:00',
            endTime: '12:00',
            targetAudience: 'Families welcome',
            description: 'Weekly worship service followed by small group discussion. Experience community and spiritual growth in a family-friendly atmosphere.',
            programType: 'awaken',
            isRecurring: 1,
            isActive: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Saturday Youth Study',
            subtitle: 'Young Adults (18-30)',
            dayOfWeek: 'saturday',
            startTime: '17:00',
            endTime: '18:30',
            targetAudience: 'Ages 18-30',
            description: 'Relevant biblical teaching for young adults navigating faith, career, and life transitions. Connect with peers on similar journeys.',
            programType: 'awaken',
            isRecurring: 1,
            isActive: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];

    await db.insert(bibleStudies).values(sampleBibleStudies);
    
    console.log('✅ Bible studies seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});