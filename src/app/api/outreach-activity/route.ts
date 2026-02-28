import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { getCurrentUser } from '@/lib/auth';
import { 
  outreachServiceStats, 
  transitActivityLog, 
  nourishActivityLog, 
  neighborsActivityLog, 
  voiceActivityLog, 
  havenActivityLog, 
  stepsActivityLog,
  transitBookings 
} from '@/db/schema';
import { eq, sql, desc, and, inArray } from 'drizzle-orm';

async function ensureStatsExist(serviceId: string) {
  const existing = await db.select().from(outreachServiceStats).where(eq(outreachServiceStats.serviceId, serviceId)).get();
  
  if (!existing) {
    const defaults: Record<string, any> = {
      transit: { stat1Label: 'Rides Monthly', stat2Label: 'Jobs Secured', stat3Label: 'Appointments', stat4Label: 'Hours Served' },
      nourish: { stat1Label: 'Meals Weekly', stat2Label: 'Families Served', stat3Label: 'Pantry Visits', stat4Label: 'Pounds Distributed' },
      neighbors: { stat1Label: 'Events Monthly', stat2Label: 'Volunteers', stat3Label: 'Partners', stat4Label: 'People Reached' },
      voice: { stat1Label: 'Cases Advocated', stat2Label: 'Policy Meetings', stat3Label: 'Rights Protected', stat4Label: 'Partners' },
      haven: { stat1Label: 'Sheltered Monthly', stat2Label: 'Housed Permanently', stat3Label: 'Vouchers Secured', stat4Label: 'Success Rate' },
      steps: { stat1Label: 'Crisis Calls', stat2Label: 'Rehab Placements', stat3Label: 'Recovery Support', stat4Label: 'Sobriety Rate' }
    };
    
    const def = defaults[serviceId];
    if (def) {
      const now = new Date().toISOString();
      await db.insert(outreachServiceStats).values({
        serviceId,
        stat1Label: def.stat1Label,
        stat1Value: 0,
        stat2Label: def.stat2Label,
        stat2Value: 0,
        stat3Label: def.stat3Label,
        stat3Value: 0,
        stat4Label: def.stat4Label,
        stat4Value: 0,
        createdAt: now,
        updatedAt: now
      }).run();
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, ...activityData } = body;
    const now = new Date().toISOString();

    if (!service) {
      return NextResponse.json({ error: 'Service type is required' }, { status: 400 });
    }

    await ensureStatsExist(service);

    switch (service) {
      case 'transit': {
        const { driverId, driverName, recipientName, rideType, pickupLocation, dropoffLocation, hoursServed = 1, notes } = activityData;
        
        if (!driverName || !recipientName || !rideType) {
          return NextResponse.json({ error: 'Missing required fields for transit activity' }, { status: 400 });
        }

        await db.insert(transitActivityLog).values({
          driverId,
          driverName,
          recipientName,
          rideType,
          pickupLocation,
          dropoffLocation,
          hoursServed,
          notes,
          createdAt: now
        }).run();

        await db.update(outreachServiceStats)
          .set({
            stat1Value: sql`${outreachServiceStats.stat1Value} + 1`,
            stat2Value: rideType === 'employment' ? sql`${outreachServiceStats.stat2Value} + 1` : outreachServiceStats.stat2Value,
            stat3Value: rideType === 'medical' || rideType === 'court' ? sql`${outreachServiceStats.stat3Value} + 1` : outreachServiceStats.stat3Value,
            stat4Value: sql`${outreachServiceStats.stat4Value} + ${hoursServed}`,
            updatedAt: now
          })
          .where(eq(outreachServiceStats.serviceId, 'transit'))
          .run();

        break;
      }

      case 'nourish': {
        const { volunteerId, volunteerName, distributionType, familiesServed = 1, mealsDistributed = 0, poundsDistributed = 0, hoursServed = 1, notes } = activityData;
        
        if (!volunteerName || !distributionType) {
          return NextResponse.json({ error: 'Missing required fields for nourish activity' }, { status: 400 });
        }

        await db.insert(nourishActivityLog).values({
          volunteerId,
          volunteerName,
          distributionType,
          familiesServed,
          mealsDistributed,
          poundsDistributed,
          hoursServed,
          notes,
          createdAt: now
        }).run();

        await db.update(outreachServiceStats)
          .set({
            stat1Value: sql`${outreachServiceStats.stat1Value} + ${mealsDistributed}`,
            stat2Value: sql`${outreachServiceStats.stat2Value} + ${familiesServed}`,
            stat3Value: distributionType === 'pantry_visit' ? sql`${outreachServiceStats.stat3Value} + 1` : outreachServiceStats.stat3Value,
            stat4Value: sql`${outreachServiceStats.stat4Value} + ${poundsDistributed}`,
            updatedAt: now
          })
          .where(eq(outreachServiceStats.serviceId, 'nourish'))
          .run();

        break;
      }

      case 'neighbors': {
        const { organizerId, organizerName, eventType, eventName, volunteersEngaged = 1, peopleReached = 0, hoursServed = 1, notes } = activityData;
        
        if (!organizerName || !eventType || !eventName) {
          return NextResponse.json({ error: 'Missing required fields for neighbors activity' }, { status: 400 });
        }

        await db.insert(neighborsActivityLog).values({
          organizerId,
          organizerName,
          eventType,
          eventName,
          volunteersEngaged,
          peopleReached,
          hoursServed,
          notes,
          createdAt: now
        }).run();

        await db.update(outreachServiceStats)
          .set({
            stat1Value: sql`${outreachServiceStats.stat1Value} + 1`,
            stat2Value: sql`${outreachServiceStats.stat2Value} + ${volunteersEngaged}`,
            stat4Value: sql`${outreachServiceStats.stat4Value} + ${peopleReached}`,
            updatedAt: now
          })
          .where(eq(outreachServiceStats.serviceId, 'neighbors'))
          .run();

        break;
      }

      case 'voice': {
        const { advocateId, advocateName, advocacyType, caseName, rightsProtected = 0, meetingsHeld = 0, hoursServed = 1, notes } = activityData;
        
        if (!advocateName || !advocacyType) {
          return NextResponse.json({ error: 'Missing required fields for voice activity' }, { status: 400 });
        }

        await db.insert(voiceActivityLog).values({
          advocateId,
          advocateName,
          advocacyType,
          caseName,
          rightsProtected,
          meetingsHeld,
          hoursServed,
          notes,
          createdAt: now
        }).run();

        await db.update(outreachServiceStats)
          .set({
            stat1Value: sql`${outreachServiceStats.stat1Value} + 1`,
            stat2Value: sql`${outreachServiceStats.stat2Value} + ${meetingsHeld}`,
            stat3Value: sql`${outreachServiceStats.stat3Value} + ${rightsProtected}`,
            updatedAt: now
          })
          .where(eq(outreachServiceStats.serviceId, 'voice'))
          .run();

        break;
      }

      case 'haven': {
        const { staffId, staffName, assistanceType, recipientName, shelteredCount = 0, housedPermanently = 0, vouchersSecured = 0, hoursServed = 1, notes } = activityData;
        
        if (!staffName || !assistanceType || !recipientName) {
          return NextResponse.json({ error: 'Missing required fields for haven activity' }, { status: 400 });
        }

        await db.insert(havenActivityLog).values({
          staffId,
          staffName,
          assistanceType,
          recipientName,
          shelteredCount,
          housedPermanently,
          vouchersSecured,
          hoursServed,
          notes,
          createdAt: now
        }).run();

        await db.update(outreachServiceStats)
          .set({
            stat1Value: sql`${outreachServiceStats.stat1Value} + ${shelteredCount}`,
            stat2Value: sql`${outreachServiceStats.stat2Value} + ${housedPermanently}`,
            stat3Value: sql`${outreachServiceStats.stat3Value} + ${vouchersSecured}`,
            updatedAt: now
          })
          .where(eq(outreachServiceStats.serviceId, 'haven'))
          .run();

        break;
      }

      case 'steps': {
        const { staffId, staffName, supportType, recipientName, crisisCalls = 0, rehabPlacements = 0, recoverySupportSessions = 0, hoursServed = 1, notes } = activityData;
        
        if (!staffName || !supportType) {
          return NextResponse.json({ error: 'Missing required fields for steps activity' }, { status: 400 });
        }

        await db.insert(stepsActivityLog).values({
          staffId,
          staffName,
          supportType,
          recipientName,
          crisisCalls,
          rehabPlacements,
          recoverySupportSessions,
          hoursServed,
          notes,
          createdAt: now
        }).run();

        await db.update(outreachServiceStats)
          .set({
            stat1Value: sql`${outreachServiceStats.stat1Value} + ${crisisCalls}`,
            stat2Value: sql`${outreachServiceStats.stat2Value} + ${rehabPlacements}`,
            stat3Value: sql`${outreachServiceStats.stat3Value} + ${recoverySupportSessions}`,
            stat4Value: sql`${outreachServiceStats.stat4Value} + ${hoursServed}`,
            updatedAt: now
          })
          .where(eq(outreachServiceStats.serviceId, 'steps'))
          .run();

        break;
      }

      case 'equip': {
        const { facilitatorId, facilitatorName, workshopType, workshopName, participantsCount = 0, skillsTaught = 1, jobPlacements = 0, hoursServed = 1, notes } = activityData;
        
        if (!facilitatorName || !workshopType || !workshopName) {
          return NextResponse.json({ error: 'Missing required fields for equip activity' }, { status: 400 });
        }

        // We use the database schema defined in schema.ts
        // But for the stats update, we update the outreachServiceStats table
        await db.update(outreachServiceStats)
          .set({
            stat1Value: sql`${outreachServiceStats.stat1Value} + 1`,
            stat2Value: sql`${outreachServiceStats.stat2Value} + ${participantsCount}`,
            stat3Value: sql`${outreachServiceStats.stat3Value} + ${skillsTaught}`,
            stat4Value: sql`${outreachServiceStats.stat4Value} + ${hoursServed}`,
            updatedAt: now
          })
          .where(eq(outreachServiceStats.serviceId, 'equip'))
          .run();

        break;
      }

      case 'awaken': {
        const { leaderId, leaderName, studyType, studyName, participantsCount = 0, topicsCovered = 1, hoursServed = 1, notes } = activityData;
        
        if (!leaderName || !studyType || !studyName) {
          return NextResponse.json({ error: 'Missing required fields for awaken activity' }, { status: 400 });
        }

        await db.update(outreachServiceStats)
          .set({
            stat1Value: sql`${outreachServiceStats.stat1Value} + 1`,
            stat2Value: sql`${outreachServiceStats.stat2Value} + ${participantsCount}`,
            stat3Value: sql`${outreachServiceStats.stat3Value} + ${topicsCovered}`,
            stat4Value: sql`${outreachServiceStats.stat4Value} + ${hoursServed}`,
            updatedAt: now
          })
          .where(eq(outreachServiceStats.serviceId, 'awaken'))
          .run();

        break;
      }

      case 'shepherd': {
        const { counselorId, counselorName, careType, recipientName, counselingSessions = 0, prayerRequests = 0, crisisCalls = 0, hoursServed = 1, notes } = activityData;
        
        if (!counselorName || !careType) {
          return NextResponse.json({ error: 'Missing required fields for shepherd activity' }, { status: 400 });
        }

        await db.update(outreachServiceStats)
          .set({
            stat1Value: sql`${outreachServiceStats.stat1Value} + ${counselingSessions}`,
            stat2Value: sql`${outreachServiceStats.stat2Value} + ${prayerRequests}`,
            stat3Value: sql`${outreachServiceStats.stat3Value} + ${crisisCalls}`,
            stat4Value: sql`${outreachServiceStats.stat4Value} + ${hoursServed}`,
            updatedAt: now
          })
          .where(eq(outreachServiceStats.serviceId, 'shepherd'))
          .run();

        break;
      }

      case 'bridge': {
        const { mentorId, mentorName, mentorshipType, menteeName, menteesCount = 0, supportGroupSessions = 0, hoursServed = 1, notes } = activityData;
        
        if (!mentorName || !mentorshipType) {
          return NextResponse.json({ error: 'Missing required fields for bridge activity' }, { status: 400 });
        }

        await db.update(outreachServiceStats)
          .set({
            stat1Value: sql`${outreachServiceStats.stat1Value} + ${menteesCount > 0 ? 1 : 0}`, // New mentors if first mentee? No, just mentors
            stat2Value: sql`${outreachServiceStats.stat2Value} + ${menteesCount}`,
            stat3Value: sql`${outreachServiceStats.stat3Value} + ${supportGroupSessions}`,
            stat4Value: sql`${outreachServiceStats.stat4Value} + ${hoursServed}`,
            updatedAt: now
          })
          .where(eq(outreachServiceStats.serviceId, 'bridge'))
          .run();

        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown service type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Activity logged for ${service}` });
  } catch (error) {
    console.error('Error logging outreach activity:', error);
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    const limit = parseInt(searchParams.get('limit') || '50');

      if (service === 'all_finalized') {
        // Fetch all finalized outcomes for the current user
        // Terminal statuses that indicate finalized bookings
        const TERMINAL_STATUSES = ['denied', 'ineligible', 'suspended', 'canceled', 'cancelled', 'complete', 'completed'];
        
        // 1. Transit Bookings (Finalized - hidden from active display)
        const finalizedTransit = await db.select().from(transitBookings)
          .where(and(
            eq(transitBookings.userId, currentUser.id),
            eq(transitBookings.isHiddenFromUser, true)
          ))
          .orderBy(desc(transitBookings.updatedAt))
          .limit(limit);

        // Map to a common format
        const activities = finalizedTransit.map(b => {
          const status = (b.status || '').toLowerCase();
          let title = 'Transit Request';
          let statusLabel = b.status?.toUpperCase() || 'UNKNOWN';
          
          if (status === 'completed' || status === 'complete') {
            title = 'Ride Completed';
            statusLabel = 'COMPLETED';
          } else if (status === 'denied') {
            title = 'Ride Request Denied';
            statusLabel = 'DENIED';
          } else if (status === 'ineligible') {
            title = 'Ride Request - Ineligible';
            statusLabel = 'INELIGIBLE';
          } else if (status === 'suspended') {
            title = 'Transit Service Suspended';
            statusLabel = 'SUSPENDED';
          } else if (status === 'canceled' || status === 'cancelled') {
            title = 'Ride Request Canceled';
            statusLabel = 'CANCELED';
          }

          return {
            id: `transit-${b.id}`,
            type: 'transit',
            title,
            description: `${b.pickupLocation} → ${b.destination}`,
            date: b.updatedAt || b.createdAt,
            status: statusLabel,
            details: b.deniedReason || b.staffNotes || null
          };
        });

        return NextResponse.json(activities);
      }

    if (!service) {
      return NextResponse.json({ error: 'Service type is required' }, { status: 400 });
    }

    let activities: any[] = [];

    switch (service) {
      case 'transit':
        activities = await db.select().from(transitActivityLog).orderBy(sql`${transitActivityLog.createdAt} DESC`).limit(limit).all();
        break;
      case 'nourish':
        activities = await db.select().from(nourishActivityLog).orderBy(sql`${nourishActivityLog.createdAt} DESC`).limit(limit).all();
        break;
      case 'neighbors':
        activities = await db.select().from(neighborsActivityLog).orderBy(sql`${neighborsActivityLog.createdAt} DESC`).limit(limit).all();
        break;
      case 'voice':
        activities = await db.select().from(voiceActivityLog).orderBy(sql`${voiceActivityLog.createdAt} DESC`).limit(limit).all();
        break;
      case 'haven':
        activities = await db.select().from(havenActivityLog).orderBy(sql`${havenActivityLog.createdAt} DESC`).limit(limit).all();
        break;
      case 'steps':
        activities = await db.select().from(stepsActivityLog).orderBy(sql`${stepsActivityLog.createdAt} DESC`).limit(limit).all();
        break;
      default:
        return NextResponse.json({ error: 'Unknown service type' }, { status: 400 });
    }

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching outreach activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
