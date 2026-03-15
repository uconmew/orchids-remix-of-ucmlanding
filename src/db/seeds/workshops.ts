import { db } from '@/db';
import { workshops } from '@/db/schema';

async function main() {
    // First, query existing users to get real user IDs
    const existingUsers = await db.execute('SELECT id FROM user LIMIT 5');
    const userIds = existingUsers.rows.length > 0 
        ? existingUsers.rows.map((row: any) => row.id)
        : ['user_001', 'user_002', 'user_003', 'user_004', 'user_005'];

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(18, 0, 0, 0);
    
    const fiveDaysFromNow = new Date(now);
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    fiveDaysFromNow.setHours(19, 0, 0, 0);
    
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    sevenDaysFromNow.setHours(18, 30, 0, 0);
    
    const tenDaysFromNow = new Date(now);
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
    tenDaysFromNow.setHours(17, 0, 0, 0);
    
    const twelveDaysFromNow = new Date(now);
    twelveDaysFromNow.setDate(twelveDaysFromNow.getDate() + 12);
    twelveDaysFromNow.setHours(19, 0, 0, 0);
    
    const fourteenDaysFromNow = new Date(now);
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);
    fourteenDaysFromNow.setHours(18, 0, 0, 0);

    const liveStartTime = new Date(now);
    liveStartTime.setMinutes(liveStartTime.getMinutes() - 15);
    
    const liveEndTime = new Date(now);
    liveEndTime.setMinutes(liveEndTime.getMinutes() + 45);

    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(19, 0, 0, 0);
    
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(20, 30, 0, 0);

    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const threeWeeksAgo = new Date(now);
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const sampleWorkshops = [
        {
            title: 'Leading Through Transformation: Tier 2 LDI Strategies',
            description: 'Join us for an intensive leadership development workshop designed specifically for those in recovery who are ready to take their leadership journey to the next level. This session focuses on Tier 2 Leadership Development Institute (LDI) strategies that emphasize mentorship development and systemic leadership approaches.\n\nYou will learn practical frameworks for leading others through their own transformation journeys, understand the psychology of change management, and develop skills in creating sustainable support systems. We will explore real-world case studies from UCon Ministries graduates who have successfully transitioned from participants to leaders in their communities.\n\nThis workshop is ideal for individuals who have completed at least 90 days in recovery and are passionate about giving back. You will leave with actionable strategies, a personal leadership development plan, and connections to a network of like-minded servant leaders committed to breaking cycles of incarceration and addiction.',
            hostUserId: userIds[0],
            startTime: threeDaysFromNow.toISOString(),
            endTime: new Date(threeDaysFromNow.getTime() + 90 * 60000).toISOString(),
            durationMinutes: 90,
            maxParticipants: 25,
            currentParticipants: 0,
            status: 'scheduled',
            meetingRoomId: 'room_' + Math.random().toString(36).substring(2, 15),
            category: 'Leadership Development',
            imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
            isFeatured: true,
            createdAt: threeWeeksAgo.toISOString(),
            updatedAt: twoDaysAgo.toISOString(),
        },
        {
            title: 'Healing from Past Wounds: A Christ-Centered Approach',
            description: 'Trauma is often at the root of addiction and destructive patterns, but healing is possible through Christ. This comprehensive workshop explores trauma-informed care principles integrated with biblical healing practices. We will address the spiritual, emotional, and psychological dimensions of trauma recovery.\n\nLed by licensed counselors and pastoral care specialists, this session provides a safe space to understand how past wounds impact present behaviors. You will learn evidence-based techniques for managing triggers, processing painful memories, and developing healthy coping mechanisms rooted in Scripture and prayer.\n\nThe workshop includes guided reflection exercises, group sharing (optional), and practical tools for continuing your healing journey. Topics covered include forgiveness (of self and others), breaking generational curses, renewing your mind through God\'s Word, and finding your identity in Christ rather than your past. All participants receive a comprehensive workbook and resource guide.\n\nThis is a foundation-level workshop suitable for anyone beginning their trauma recovery journey or seeking to deepen their understanding of Christ-centered healing.',
            hostUserId: userIds[1],
            startTime: fiveDaysFromNow.toISOString(),
            endTime: new Date(fiveDaysFromNow.getTime() + 120 * 60000).toISOString(),
            durationMinutes: 120,
            maxParticipants: 30,
            currentParticipants: 0,
            status: 'scheduled',
            meetingRoomId: 'room_' + Math.random().toString(36).substring(2, 15),
            category: 'Trauma Recovery',
            imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800',
            isFeatured: true,
            createdAt: threeWeeksAgo.toISOString(),
            updatedAt: twoDaysAgo.toISOString(),
        },
        {
            title: 'Discovering Purpose in Scripture: Romans Study',
            description: 'Join us RIGHT NOW for a live, in-depth exploration of the Book of Romans, one of the most transformative books in Scripture. This session focuses specifically on finding purpose in suffering and understanding how God uses our struggles for His glory and our growth.\n\nWe are currently diving into Romans chapters 5-8, examining Paul\'s teachings on justification, sanctification, and glorification. Discover how your past does not define your future and how God is working all things together for good. This interactive study includes verse-by-verse analysis, historical context, and practical application for daily life.\n\nThe session includes live Q&A, breakout discussions, and personal reflection time. Whether you are new to Bible study or a seasoned student of Scripture, this workshop offers fresh insights into God\'s redemptive plan for your life. Participants are encouraged to have a Bible available (physical or digital) and come ready to engage deeply with the text.\n\nThis is the third session in our Romans series, but newcomers are welcome as we provide context and recap key themes.',
            hostUserId: userIds[2],
            startTime: liveStartTime.toISOString(),
            endTime: liveEndTime.toISOString(),
            durationMinutes: 60,
            maxParticipants: 50,
            currentParticipants: 12,
            status: 'live',
            meetingRoomId: 'room_' + Math.random().toString(36).substring(2, 15),
            category: 'Biblical Studies',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
            isFeatured: false,
            createdAt: twoWeeksAgo.toISOString(),
            updatedAt: new Date(now.getTime() - 5 * 60000).toISOString(),
        },
        {
            title: 'Financial Freedom: Breaking the Cycle of Poverty',
            description: 'Financial instability often accompanies addiction and incarceration, creating cycles that are difficult to break. This practical workshop equips you with essential financial literacy skills and biblical principles of stewardship to help you build a stable economic foundation.\n\nTopics include: creating and maintaining a budget, understanding credit scores and how to repair damaged credit, strategies for paying off debt, building an emergency fund, and planning for long-term financial goals. We will address the unique financial challenges faced by those with criminal records, including employment gaps and limited access to traditional banking services.\n\nThe workshop is taught by certified financial counselors who understand the reentry journey. You will learn about community resources, second-chance banking programs, and practical tools for managing money effectively. We will also explore biblical wisdom on money management, generosity, and contentment.\n\nParticipants receive a personalized financial assessment tool, budget templates, and connections to local financial empowerment programs. This is a judgment-free zone focused on practical solutions and hope for financial transformation.',
            hostUserId: userIds[3],
            startTime: sevenDaysFromNow.toISOString(),
            endTime: new Date(sevenDaysFromNow.getTime() + 90 * 60000).toISOString(),
            durationMinutes: 90,
            maxParticipants: 35,
            currentParticipants: 0,
            status: 'scheduled',
            meetingRoomId: 'room_' + Math.random().toString(36).substring(2, 15),
            category: 'Life Skills',
            imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
            isFeatured: false,
            createdAt: twoWeeksAgo.toISOString(),
            updatedAt: twoDaysAgo.toISOString(),
        },
        {
            title: 'Resume Building and Interview Skills for Second Chances',
            description: 'Landing meaningful employment is one of the most critical factors in successful reentry, but navigating job applications and interviews with a criminal record requires specific strategies. This comprehensive career development workshop provides practical tools for presenting your best self to potential employers.\n\nYou will learn how to craft a compelling resume that highlights your skills and transformation while honestly addressing employment gaps. We cover best practices for disclosure, how to explain your past in a way that demonstrates growth and accountability, and techniques for framing your reentry journey as evidence of resilience and determination.\n\nThe workshop includes mock interview sessions with real-time feedback, guidance on appropriate interview attire and body language, and strategies for answering difficult questions about your background. We will discuss your rights under Ban the Box legislation and other fair chance hiring policies, and connect you with employers who actively hire individuals with criminal records.\n\nLed by career counselors and HR professionals who specialize in reentry employment, this session also covers job search strategies, networking tips, and how to use LinkedIn and other platforms effectively. Participants receive personalized resume reviews and access to our employer network.',
            hostUserId: userIds[4],
            startTime: tenDaysFromNow.toISOString(),
            endTime: new Date(tenDaysFromNow.getTime() + 120 * 60000).toISOString(),
            durationMinutes: 120,
            maxParticipants: 20,
            currentParticipants: 0,
            status: 'scheduled',
            meetingRoomId: 'room_' + Math.random().toString(36).substring(2, 15),
            category: 'Career Development',
            imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
            isFeatured: false,
            createdAt: twoWeeksAgo.toISOString(),
            updatedAt: twoDaysAgo.toISOString(),
        },
        {
            title: 'Rebuilding Trust: Reconciliation After Addiction',
            description: 'Addiction damages relationships, and rebuilding trust with family members is one of the most challenging and important aspects of recovery. This completed workshop (held yesterday) focused on family restoration through Christ-centered principles and evidence-based communication strategies.\n\nThe session explored the dynamics of codependency, enabling behaviors, and healthy boundary-setting. Participants learned how to take accountability for past hurts while also recognizing that rebuilding takes time and consistent action. We discussed the importance of making amends, demonstrating changed behavior, and being patient with family members who may be skeptical or hurt.\n\nThe workshop provided practical tools for effective communication, conflict resolution, and rebuilding emotional intimacy. Topics included active listening, expressing emotions constructively, and creating family rituals that support recovery. We also addressed situations where reconciliation may not be possible or safe, and how to find healing and peace in those circumstances.\n\nThis was a powerful session with vulnerable sharing and genuine community support. Participants left with action plans for their specific family situations and ongoing resources for family counseling and support groups.',
            hostUserId: userIds[0],
            startTime: yesterdayStart.toISOString(),
            endTime: yesterdayEnd.toISOString(),
            durationMinutes: 90,
            maxParticipants: 25,
            currentParticipants: 18,
            status: 'completed',
            meetingRoomId: 'room_' + Math.random().toString(36).substring(2, 15),
            category: 'Family Restoration',
            imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800',
            isFeatured: false,
            createdAt: threeWeeksAgo.toISOString(),
            updatedAt: yesterday.toISOString(),
        },
        {
            title: '90 Days Clean: Strategies for Long-Term Sobriety',
            description: 'Reaching 90 days of sobriety is a significant milestone, but maintaining long-term recovery requires ongoing commitment and effective strategies. This workshop is designed for individuals who have achieved initial sobriety and are ready to build sustainable recovery practices for lifelong freedom from addiction.\n\nWe will explore evidence-based relapse prevention techniques, including identifying personal triggers, developing healthy coping mechanisms, and creating a robust support network. The session includes practical tools for managing cravings, dealing with high-risk situations, and bouncing back from setbacks without returning to active addiction.\n\nTopics covered include: the neuroscience of addiction and recovery, stress management techniques, the importance of structure and routine, nutrition and exercise for recovery, and spiritual practices that support sobriety. We will discuss the role of 12-step programs, faith-based recovery groups, and professional counseling in long-term success.\n\nLed by individuals with years of sustained recovery and certified addiction counselors, this workshop creates a safe, judgment-free space for honest discussion about the challenges of staying sober. Participants receive a comprehensive relapse prevention workbook and ongoing access to our recovery support community.',
            hostUserId: userIds[1],
            startTime: twelveDaysFromNow.toISOString(),
            endTime: new Date(twelveDaysFromNow.getTime() + 120 * 60000).toISOString(),
            durationMinutes: 120,
            maxParticipants: 30,
            currentParticipants: 0,
            status: 'scheduled',
            meetingRoomId: 'room_' + Math.random().toString(36).substring(2, 15),
            category: 'Substance Recovery',
            imageUrl: 'https://images.unsplash.com/photo-1502139214982-d0ad755818d8?w=800',
            isFeatured: true,
            createdAt: twoWeeksAgo.toISOString(),
            updatedAt: twoDaysAgo.toISOString(),
        },
        {
            title: 'From Served to Servant: Discovering Your Ministry Calling',
            description: 'One of the most powerful aspects of recovery is the opportunity to use your story and experiences to help others facing similar struggles. This workshop helps you discover how God can transform your pain into purpose and your testimony into ministry.\n\nWe will explore various ways to serve in your community, from formal volunteer roles to informal mentorship opportunities. You will learn how to share your story effectively and appropriately, understanding the balance between vulnerability and wisdom. The session includes practical guidance on setting healthy boundaries while serving others and avoiding the trap of finding identity solely in helping roles.\n\nTopics include: identifying your spiritual gifts and natural talents, exploring volunteer opportunities at UCon Ministries and partner organizations, understanding the difference between helping and enabling, and developing a personal mission statement. We will discuss the importance of continued personal growth and self-care while serving others.\n\nThis workshop is led by UCon Ministries graduates who have successfully transitioned into leadership and service roles. Hear their stories, learn from their experiences, and discover practical next steps for your own journey from served to servant. Participants receive information about volunteer opportunities, mentorship training programs, and ongoing leadership development resources.',
            hostUserId: userIds[2],
            startTime: fourteenDaysFromNow.toISOString(),
            endTime: new Date(fourteenDaysFromNow.getTime() + 60 * 60000).toISOString(),
            durationMinutes: 60,
            maxParticipants: 40,
            currentParticipants: 0,
            status: 'scheduled',
            meetingRoomId: 'room_' + Math.random().toString(36).substring(2, 15),
            category: 'Community Service',
            imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
            isFeatured: false,
            createdAt: twoWeeksAgo.toISOString(),
            updatedAt: twoDaysAgo.toISOString(),
        },
    ];

    await db.insert(workshops).values(sampleWorkshops);
    
    console.log('✅ Workshops seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});