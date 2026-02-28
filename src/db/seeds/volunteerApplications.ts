import { db } from '@/db';
import { volunteerApplications } from '@/db/schema';

async function main() {
    const now = new Date();
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const twentyFiveDaysAgo = new Date(now);
    twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);
    
    const twentyDaysAgo = new Date(now);
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
    
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const sampleApplications = [
        {
            firstName: 'Emily',
            lastName: 'Rodriguez',
            email: 'emily.rodriguez@email.com',
            phone: '(555) 234-5678',
            address: '456 Maple Street',
            city: 'Denver',
            state: 'CO',
            zipCode: '80203',
            availability: 'weekends',
            interests: '["outreach", "food_distribution", "transportation"]',
            experience: 'I have 3 years of volunteer experience with homeless shelters and food banks. Previously volunteered with Denver Rescue Mission and Feeding America Colorado.',
            whyVolunteer: "I feel called to serve those experiencing hardship. UCon's holistic approach to transformation resonates deeply with me, and I want to be part of helping people find their purpose after difficult seasons.",
            backgroundCheckConsent: 1,
            status: 'pending',
            submittedAt: threeDaysAgo.toISOString(),
            reviewedAt: null,
            notes: null,
        },
        {
            firstName: 'Marcus',
            lastName: 'Johnson',
            email: 'mjohnson@email.com',
            phone: '(555) 876-5432',
            address: '789 Oak Avenue, Apt 4B',
            city: 'Aurora',
            state: 'CO',
            zipCode: '80010',
            availability: 'both',
            interests: '["workshops", "administrative", "outreach"]',
            experience: 'Former LDI graduate (Tier 4, 2022). I went through my own journey of recovery and transformation through UCon. Now I want to give back and help others find the same hope I found.',
            whyVolunteer: "UCon saved my life. After struggling with addiction and incarceration, the LDI program gave me purpose and taught me leadership. I'm passionate about mentoring others who are walking the same path I once walked.",
            backgroundCheckConsent: 1,
            status: 'approved',
            submittedAt: twentyFiveDaysAgo.toISOString(),
            reviewedAt: twentyDaysAgo.toISOString(),
            notes: 'Excellent candidate! LDI graduate with lived experience. Approved for mentorship and workshop facilitation roles.',
        },
        {
            firstName: 'Sarah',
            lastName: 'Thompson',
            email: 'sarah.t@email.com',
            phone: '(555) 345-9012',
            address: '123 Pine Lane',
            city: 'Lakewood',
            state: 'CO',
            zipCode: '80226',
            availability: 'weekdays',
            interests: '["administrative", "workshops"]',
            experience: 'Background in nonprofit administration and event planning. I worked with United Way for 5 years coordinating volunteer programs and community workshops.',
            whyVolunteer: "I'm drawn to UCon's three-track model and evidence-based approach to transformation. I believe my administrative skills can help streamline operations so staff can focus more on direct ministry impact.",
            backgroundCheckConsent: 1,
            status: 'pending',
            submittedAt: oneDayAgo.toISOString(),
            reviewedAt: null,
            notes: null,
        },
    ];

    await db.insert(volunteerApplications).values(sampleApplications);
    
    console.log('✅ Volunteer applications seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});