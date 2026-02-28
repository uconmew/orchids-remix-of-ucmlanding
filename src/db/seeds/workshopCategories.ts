import { db } from '@/db';
import { workshopCategories } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();
    
    const sampleCategories = [
        {
            name: 'Financial Literacy',
            description: 'Learn essential money management skills, budgeting strategies, and financial planning for long-term stability and independence.',
            icon: 'DollarSign',
            skills: JSON.stringify(['Budgeting basics', 'Debt management', 'Savings strategies', 'Credit building']),
            programType: 'equip',
            sortOrder: 0,
            isActive: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            name: 'Communication Skills',
            description: 'Develop effective communication techniques, active listening abilities, and conflict resolution strategies for healthier relationships.',
            icon: 'MessageSquare',
            skills: JSON.stringify(['Active listening', 'Conflict resolution', 'Public speaking', 'Assertiveness']),
            programType: 'equip',
            sortOrder: 1,
            isActive: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            name: 'Job Readiness',
            description: 'Prepare for employment success with resume building, interview techniques, career planning, and workplace professionalism.',
            icon: 'Briefcase',
            skills: JSON.stringify(['Resume writing', 'Interview skills', 'Career planning', 'Workplace etiquette']),
            programType: 'equip',
            sortOrder: 2,
            isActive: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            name: 'Creative Expression',
            description: 'Explore healing and self-discovery through various creative outlets including art, writing, music, and drama.',
            icon: 'PenTool',
            skills: JSON.stringify(['Art therapy', 'Creative writing', 'Music and rhythm', 'Drama and storytelling']),
            programType: 'equip',
            sortOrder: 3,
            isActive: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            name: 'Life Skills',
            description: 'Master essential daily living skills including time management, household organization, cooking, and practical life management.',
            icon: 'Home',
            skills: JSON.stringify(['Time management', 'Household management', 'Cooking basics', 'Organization skills']),
            programType: 'equip',
            sortOrder: 4,
            isActive: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            name: 'Relationships',
            description: 'Build healthier relationships through understanding boundaries, family dynamics, trust-building, and effective parenting strategies.',
            icon: 'Heart',
            skills: JSON.stringify(['Healthy boundaries', 'Family dynamics', 'Parenting skills', 'Building trust']),
            programType: 'equip',
            sortOrder: 5,
            isActive: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            name: 'Personal Development',
            description: 'Cultivate personal growth through goal-setting, self-esteem building, stress management, and mindfulness practices.',
            icon: 'Target',
            skills: JSON.stringify(['Goal setting', 'Self-esteem building', 'Stress management', 'Mindfulness practices']),
            programType: 'equip',
            sortOrder: 6,
            isActive: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            name: 'Community Skills',
            description: 'Engage meaningfully with your community through volunteering, civic participation, networking, and social responsibility.',
            icon: 'Users',
            skills: JSON.stringify(['Volunteering', 'Civic engagement', 'Networking', 'Social responsibility']),
            programType: 'equip',
            sortOrder: 7,
            isActive: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
    ];

    await db.insert(workshopCategories).values(sampleCategories);
    
    console.log('✅ Workshop categories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});