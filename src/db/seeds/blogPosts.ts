import { db } from '@/db';
import { blogPosts } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const sampleBlogPosts = [
        {
            title: 'UCon Ministries Opens New Community Center in Denver',
            slug: 'ucon-ministries-opens-new-community-center-in-denver',
            published: 1,
            author: 'Pastor Michael Thompson',
            category: 'news',
            excerpt: 'We are thrilled to announce the opening of our new 15,000 square foot community center in downtown Denver, expanding our reach to serve more families in need.',
            content: `We are overwhelmed with gratitude as we celebrate the grand opening of our new community center in downtown Denver. This 15,000 square foot facility represents years of prayer, planning, and the generous support of our community. Located at the heart of Denver's downtown district, this center will serve as a beacon of hope for families facing hardship.

The new facility features a full-service food pantry, clothing distribution center, computer lab with internet access, counseling rooms, and a multipurpose hall for workshops and community gatherings. We've designed every space with dignity and compassion in mind, ensuring that everyone who walks through our doors feels welcomed and valued.

Our vision for this center extends beyond meeting immediate physical needs. We're launching comprehensive programs including job training workshops, financial literacy classes, GED preparation courses, and youth mentorship programs. The computer lab will provide free access to technology and training for job searches and skill development.

This achievement wouldn't have been possible without the dedication of our volunteers, the generosity of our donors, and the guidance of our Lord. We invite the community to join us for our official ribbon-cutting ceremony next Saturday at 10 AM. Together, we're building a stronger, more compassionate Denver where no one walks alone through their struggles.`,
            featuredImageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800',
            publishedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            title: "From Addiction to Purpose: Mark's Journey Through LDI",
            slug: 'from-addiction-to-purpose-marks-journey-through-ldi',
            published: 1,
            author: 'Sarah Williams',
            category: 'testimony',
            excerpt: "Mark's transformation from addiction and homelessness to becoming a mentor in UCon's Leadership Development Institute is a powerful testament to God's redemptive love and the impact of community support.",
            content: `Three years ago, Mark walked into UCon Ministries weighing barely 130 pounds, having lost everything to addiction. His family had given up hope, he'd been living on the streets for two years, and he couldn't see a way forward. Today, Mark is clean, employed, reconciled with his family, and serving as a mentor in our Leadership Development Institute—the same program that saved his life.

Mark's journey wasn't easy. The first few months in our recovery program were the hardest of his life. "I wanted to quit every single day," Mark shares. "But my mentor, James, never gave up on me. He showed up every week, sometimes just to sit with me in silence when I couldn't talk. He saw something in me that I couldn't see in myself." Through weekly one-on-one mentorship, group counseling, and practical life skills training, Mark slowly began to rebuild his life from the ground up.

The turning point came when Mark joined a LDI small group focused on discovering purpose beyond survival. "I realized I wasn't just fighting addiction—I was searching for meaning," he explains. "The program helped me understand that my past didn't define my future, and that my struggles could actually help others." Mark completed his GED through our education program, secured stable housing through our partnerships, and found work at a local construction company whose owner is part of our ministry network.

Now, Mark spends his Thursday evenings mentoring three men who are walking the same difficult path he once traveled. "Every time I share my story, I'm reminded of how far God has brought me," Mark says with tears in his eyes. "These guys need to know that recovery is possible, that they're not alone, and that there's purpose waiting for them on the other side of their struggle. If God can transform my mess into a message of hope, He can do it for anyone." Mark's story is just one of many testimonies of transformation happening through UCon's Leadership Development Institute.`,
            featuredImageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
            publishedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            title: 'Outreach Program Serves 500 Families This Quarter',
            slug: 'outreach-program-serves-500-families-this-quarter',
            published: 1,
            author: 'Jennifer Martinez',
            category: 'update',
            excerpt: 'Our Q1 outreach initiatives have reached new heights, providing food assistance, transportation services, and emergency shelter to over 500 families across the Denver metro area.',
            content: `We're grateful to report that our first quarter outreach programs have served 523 families across the Denver metro area, representing our largest quarter of service to date. Our food distribution program provided 12,000 meals through weekly food pantry visits and emergency food boxes. Additionally, our partnership with local farmers allowed us to distribute fresh produce to 300 families who typically lack access to healthy, nutritious food options.

Our transportation ministry has been a game-changer for families facing mobility challenges. This quarter, volunteer drivers provided 847 rides to medical appointments, job interviews, and essential services. Maria, a single mother of three, shared, "Without UCon's transportation help, I would have missed my son's specialist appointments. They don't just provide rides—they provide dignity and hope." We also distributed 45 bus passes to individuals actively job searching, removing a major barrier to employment.

Emergency shelter assistance reached 89 families facing immediate housing crises this quarter. Through our rapid response fund and partnerships with local shelters, we prevented 34 families from entering homelessness and helped 55 families transition from emergency shelter to stable housing. Our case managers worked alongside each family to address the root causes of housing instability, connecting them with job training, financial counseling, and ongoing support. As we move into Q2, we're expanding our volunteer base and strengthening community partnerships to serve even more families in need.`,
            featuredImageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
            publishedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            title: 'New Financial Literacy Workshop Series Starting March 2025',
            slug: 'new-financial-literacy-workshop-series-starting-march-2025',
            published: 0,
            author: 'David Chen',
            category: 'announcement',
            excerpt: 'Join us for an 8-week comprehensive financial literacy workshop designed to empower individuals and families with practical money management skills and biblical financial principles.',
            content: `We're excited to announce the launch of our new Financial Literacy Workshop Series beginning March 5th, 2025. This free 8-week program is designed to equip participants with practical financial skills and biblical wisdom for managing money effectively. Whether you're struggling with debt, trying to build savings, or simply want to make better financial decisions, this workshop series will provide the tools and knowledge you need.

Each weekly session will cover essential topics including budgeting basics, debt reduction strategies, building emergency funds, understanding credit, saving for long-term goals, teaching children about money, and giving generously. Our experienced facilitators bring both financial expertise and pastoral care, creating a supportive environment where participants can ask questions without judgment. All materials, including workbooks and planning tools, are provided free of charge.

The workshop series will meet every Wednesday evening from 6:30 PM to 8:00 PM at our community center, with childcare provided for families with young children. Space is limited to 30 participants to ensure personalized attention and meaningful group discussions. Registration opens February 15th through our website or by calling our office at 720.663.9243. Light refreshments will be served, and participants who complete all 8 sessions will receive a certificate of completion and ongoing access to our financial coaching services. Don't miss this opportunity to gain financial freedom and peace of mind.`,
            featuredImageUrl: 'https://images.unsplash.com/photo-1554224311-beee4f8a089b?w=800',
            publishedAt: null,
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            title: "Finding Community After Homelessness: Lisa's Story",
            slug: 'finding-community-after-homelessness-lisas-story',
            published: 1,
            author: 'Rachel Anderson',
            category: 'testimony',
            excerpt: "Lisa's journey from living in her car to stable housing and meaningful community demonstrates how comprehensive support and genuine relationships can transform lives.",
            content: `When Lisa first connected with UCon Ministries eighteen months ago, she had been living in her car for six months after losing her job and apartment. A devoted mother to two teenage daughters, Lisa did everything she could to maintain normalcy—her daughters showered at the gym, they ate meals from food banks, and Lisa worked odd jobs to keep gas in the car. Despite her best efforts, the weight of uncertainty and shame was crushing her spirit.

Lisa's path to stability began when she walked into our community center seeking help with her daughters' school supplies. Our intake coordinator, Rebecca, immediately recognized that Lisa needed more than school supplies—she needed hope and a comprehensive support system. Within days, Lisa was connected with emergency housing assistance, enrolled in our case management program, and matched with a mentor who had walked a similar journey. "Rebecca didn't just see my immediate need," Lisa recalls. "She saw me as a whole person with potential and dreams, not just someone to pity."

The next six months were transformative. Through our housing assistance program, Lisa secured a two-bedroom apartment. Our job placement partnership helped her land a stable position with benefits at a local healthcare facility. But what changed everything for Lisa wasn't just the practical support—it was the community she found. "I had been so isolated and ashamed," she shares. "But the women in my support group became my family. They celebrated every victory with me and held me up during setbacks. I learned that asking for help isn't weakness—it's wisdom."

Today, Lisa is thriving. Her daughters are excelling in school, she's been promoted at work, and she's building savings for the first time in years. But the most remarkable change is her role in the community. Lisa now volunteers with our housing assistance program, using her experience to help other families navigate the path from homelessness to stability. "I want others to know what I learned: your current situation doesn't define your future," Lisa says. "With the right support and community, transformation is possible. UCon didn't just help me find housing—they helped me find myself again and discover that my story could bring hope to others."`,
            featuredImageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800',
            publishedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(blogPosts).values(sampleBlogPosts);
    
    console.log('✅ Blog posts seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});