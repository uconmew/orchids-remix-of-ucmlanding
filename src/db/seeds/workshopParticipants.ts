import { db } from '@/db';
import { workshopParticipants } from '@/db/schema';

async function main() {
    // Helper function to generate random peer ID
    const generatePeerId = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let peerId = 'peer_';
        for (let i = 0; i < 8; i++) {
            peerId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return peerId;
    };

    // Time calculations
    const now = new Date();
    const liveWorkshopStart = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes ago
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(19, 0, 0, 0); // 7:00 PM yesterday
    const completedWorkshopStart = yesterday;
    const completedWorkshopEnd = new Date(yesterday.getTime() + 90 * 60 * 1000); // 8:30 PM

    // LIVE Workshop (Biblical Studies, id=3) - 10 participants
    const liveParticipants = [
        // Host participant
        {
            workshopId: 3,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            userName: 'Rev. Michael Thompson',
            peerId: generatePeerId(),
            isHost: true,
            isMuted: false,
            isVideoOff: false,
            joinedAt: liveWorkshopStart.toISOString(),
            leftAt: null,
        },
        // Regular participants
        {
            workshopId: 3,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            userName: 'Sarah Johnson',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: false,
            joinedAt: new Date(liveWorkshopStart.getTime() + 2 * 60 * 1000).toISOString(),
            leftAt: null,
        },
        {
            workshopId: 3,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r6',
            userName: 'David Martinez',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: true,
            isVideoOff: false,
            joinedAt: new Date(liveWorkshopStart.getTime() + 3 * 60 * 1000).toISOString(),
            leftAt: null,
        },
        {
            workshopId: 3,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r7',
            userName: 'Emily Chen',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: true,
            joinedAt: new Date(liveWorkshopStart.getTime() + 4 * 60 * 1000).toISOString(),
            leftAt: null,
        },
        {
            workshopId: 3,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r8',
            userName: 'James Wilson',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: false,
            joinedAt: new Date(liveWorkshopStart.getTime() + 5 * 60 * 1000).toISOString(),
            leftAt: null,
        },
        {
            workshopId: 3,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r9',
            userName: 'Maria Rodriguez',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: true,
            isVideoOff: true,
            joinedAt: new Date(liveWorkshopStart.getTime() + 6 * 60 * 1000).toISOString(),
            leftAt: null,
        },
        {
            workshopId: 3,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8s0',
            userName: 'Robert Anderson',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: true,
            joinedAt: new Date(liveWorkshopStart.getTime() + 7 * 60 * 1000).toISOString(),
            leftAt: null,
        },
        {
            workshopId: 3,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8s1',
            userName: 'Linda Taylor',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: false,
            joinedAt: new Date(liveWorkshopStart.getTime() + 8 * 60 * 1000).toISOString(),
            leftAt: null,
        },
        {
            workshopId: 3,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8s2',
            userName: 'Christopher Lee',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: true,
            isVideoOff: false,
            joinedAt: new Date(liveWorkshopStart.getTime() + 10 * 60 * 1000).toISOString(),
            leftAt: null,
        },
        {
            workshopId: 3,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8s3',
            userName: 'Patricia Brown',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: true,
            joinedAt: new Date(liveWorkshopStart.getTime() + 12 * 60 * 1000).toISOString(),
            leftAt: null,
        },
    ];

    // COMPLETED Workshop (Family Restoration, id=6) - 18 participants
    const completedParticipants = [
        // Host participant
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            userName: 'Dr. Grace Williams',
            peerId: generatePeerId(),
            isHost: true,
            isMuted: false,
            isVideoOff: false,
            joinedAt: completedWorkshopStart.toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() + 5 * 60 * 1000).toISOString(),
        },
        // Regular participants
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8s4',
            userName: 'Thomas Miller',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: true,
            isVideoOff: false,
            joinedAt: new Date(completedWorkshopStart.getTime() + 1 * 60 * 1000).toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() - 2 * 60 * 1000).toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8s5',
            userName: 'Jennifer Davis',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: true,
            joinedAt: new Date(completedWorkshopStart.getTime() + 2 * 60 * 1000).toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() + 8 * 60 * 1000).toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8s6',
            userName: 'Michael Garcia',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: false,
            joinedAt: new Date(completedWorkshopStart.getTime() + 3 * 60 * 1000).toISOString(),
            leftAt: completedWorkshopEnd.toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8s7',
            userName: 'Elizabeth Martinez',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: true,
            isVideoOff: true,
            joinedAt: new Date(completedWorkshopStart.getTime() + 4 * 60 * 1000).toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() + 3 * 60 * 1000).toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8s8',
            userName: 'Daniel Rodriguez',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: false,
            joinedAt: new Date(completedWorkshopStart.getTime() + 5 * 60 * 1000).toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() - 5 * 60 * 1000).toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8s9',
            userName: 'Susan Wilson',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: true,
            joinedAt: new Date(completedWorkshopStart.getTime() + 6 * 60 * 1000).toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() + 10 * 60 * 1000).toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8t0',
            userName: 'Joseph Anderson',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: true,
            isVideoOff: false,
            joinedAt: new Date(completedWorkshopStart.getTime() + 7 * 60 * 1000).toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() + 2 * 60 * 1000).toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8t1',
            userName: 'Nancy Taylor',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: false,
            joinedAt: new Date(completedWorkshopStart.getTime() + 8 * 60 * 1000).toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() - 3 * 60 * 1000).toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8t2',
            userName: 'Paul Thomas',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: true,
            joinedAt: new Date(completedWorkshopStart.getTime() + 9 * 60 * 1000).toISOString(),
            leftAt: completedWorkshopEnd.toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8t3',
            userName: 'Karen Jackson',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: true,
            isVideoOff: false,
            joinedAt: new Date(completedWorkshopStart.getTime() + 10 * 60 * 1000).toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() + 7 * 60 * 1000).toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8t4',
            userName: 'Mark White',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: false,
            joinedAt: new Date(completedWorkshopStart.getTime() + 11 * 60 * 1000).toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() + 12 * 60 * 1000).toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8t5',
            userName: 'Betty Harris',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: true,
            joinedAt: new Date(completedWorkshopStart.getTime() + 12 * 60 * 1000).toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() - 8 * 60 * 1000).toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8t6',
            userName: 'Steven Martin',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: true,
            isVideoOff: true,
            joinedAt: new Date(completedWorkshopStart.getTime() + 13 * 60 * 1000).toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() + 4 * 60 * 1000).toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8t7',
            userName: 'Lisa Thompson',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: false,
            joinedAt: new Date(completedWorkshopStart.getTime() + 14 * 60 * 1000).toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() + 6 * 60 * 1000).toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8t8',
            userName: 'Brian Garcia',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: false,
            joinedAt: new Date(completedWorkshopStart.getTime() + 15 * 60 * 1000).toISOString(),
            leftAt: completedWorkshopEnd.toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8t9',
            userName: 'Sandra Martinez',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: true,
            isVideoOff: false,
            joinedAt: new Date(completedWorkshopStart.getTime() + 16 * 60 * 1000).toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() + 9 * 60 * 1000).toISOString(),
        },
        {
            workshopId: 6,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8u0',
            userName: 'Kevin Robinson',
            peerId: generatePeerId(),
            isHost: false,
            isMuted: false,
            isVideoOff: true,
            joinedAt: new Date(completedWorkshopStart.getTime() + 18 * 60 * 1000).toISOString(),
            leftAt: new Date(completedWorkshopEnd.getTime() + 11 * 60 * 1000).toISOString(),
        },
    ];

    // Combine all participants
    const allParticipants = [...liveParticipants, ...completedParticipants];

    await db.insert(workshopParticipants).values(allParticipants);
    
    console.log('✅ Workshop participants seeder completed successfully');
    console.log(`   - ${liveParticipants.length} participants in LIVE workshop (Biblical Studies)`);
    console.log(`   - ${completedParticipants.length} participants in COMPLETED workshop (Family Restoration)`);
    console.log(`   - Total: ${allParticipants.length} participants seeded`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});