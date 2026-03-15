import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  transitActivityLog,
  nourishActivityLog,
  neighborsActivityLog,
  voiceActivityLog,
  havenActivityLog,
  stepsActivityLog,
  equipActivityLog,
  awakenActivityLog,
  shepherdActivityLog,
  bridgeActivityLog,
  workshopRegistrations,
  eventRegistrations,
  transitBookings,
  convicts,
  user,
} from '@/db/schema';
import { eq, desc, sql, or } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const convictId = parseInt(id);

    if (isNaN(convictId)) {
      return NextResponse.json({ error: 'Invalid convict ID' }, { status: 400 });
    }

    const convict = await db
      .select()
      .from(convicts)
      .where(eq(convicts.id, convictId))
      .limit(1);

    if (convict.length === 0) {
      return NextResponse.json({ error: 'Convict not found' }, { status: 404 });
    }

    const convictData = convict[0];
    const activities: any[] = [];

    if (convictData.userId) {
      const transitRides = await db
        .select()
        .from(transitActivityLog)
        .where(eq(transitActivityLog.recipientName, `${convictData.firstName} ${convictData.lastName}`))
        .orderBy(desc(transitActivityLog.createdAt))
        .limit(20);

      transitRides.forEach((ride) => {
        activities.push({
          type: 'TRANSIT',
          rideType: ride.rideType,
          pickupLocation: ride.pickupLocation,
          dropoffLocation: ride.dropoffLocation,
          notes: ride.notes,
          timestamp: ride.createdAt,
        });
      });

      const bookings = await db
        .select()
        .from(transitBookings)
        .where(
          or(
            eq(transitBookings.convictId, convictId),
            eq(transitBookings.userId, convictData.userId)
          )
        )
        .orderBy(desc(transitBookings.createdAt))
        .limit(20);

      bookings.forEach((booking) => {
        activities.push({
          type: 'TRANSIT_BOOKING',
          status: booking.status,
          pickupLocation: booking.pickupLocation,
          destination: booking.destination,
          requestedTime: booking.requestedTime,
          notes: booking.userNotes,
          timestamp: booking.createdAt,
        });
      });

      const workshops = await db
        .select()
        .from(workshopRegistrations)
        .where(eq(workshopRegistrations.userId, convictData.userId))
        .orderBy(desc(workshopRegistrations.registeredAt))
        .limit(20);

      workshops.forEach((reg) => {
        activities.push({
          type: 'WORKSHOP',
          workshopName: `Workshop #${reg.workshopId}`,
          status: reg.status,
          notes: reg.notes,
          timestamp: reg.registeredAt,
        });
      });
    }

    const nourishEntries = await db
      .select()
      .from(nourishActivityLog)
      .where(sql`${nourishActivityLog.volunteerName} ILIKE ${`%${convictData.firstName}%`}`)
      .orderBy(desc(nourishActivityLog.createdAt))
      .limit(10);

    nourishEntries.forEach((entry) => {
      activities.push({
        type: 'NOURISH',
        distributionType: entry.distributionType,
        familiesServed: entry.familiesServed,
        notes: entry.notes,
        timestamp: entry.createdAt,
      });
    });

    const havenEntries = await db
      .select()
      .from(havenActivityLog)
      .where(eq(havenActivityLog.recipientName, `${convictData.firstName} ${convictData.lastName}`))
      .orderBy(desc(havenActivityLog.createdAt))
      .limit(10);

    havenEntries.forEach((entry) => {
      activities.push({
        type: 'HAVEN',
        assistanceType: entry.assistanceType,
        notes: entry.notes,
        timestamp: entry.createdAt,
      });
    });

    const shepherdEntries = await db
      .select()
      .from(shepherdActivityLog)
      .where(sql`${shepherdActivityLog.recipientName} ILIKE ${`%${convictData.firstName}%`}`)
      .orderBy(desc(shepherdActivityLog.createdAt))
      .limit(10);

    shepherdEntries.forEach((entry) => {
      activities.push({
        type: 'SHEPHERD',
        careType: entry.careType,
        notes: entry.notes,
        timestamp: entry.createdAt,
      });
    });

    const bridgeEntries = await db
      .select()
      .from(bridgeActivityLog)
      .where(sql`${bridgeActivityLog.menteeName} ILIKE ${`%${convictData.firstName}%`}`)
      .orderBy(desc(bridgeActivityLog.createdAt))
      .limit(10);

    bridgeEntries.forEach((entry) => {
      activities.push({
        type: 'BRIDGE',
        mentorshipType: entry.mentorshipType,
        notes: entry.notes,
        timestamp: entry.createdAt,
      });
    });

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(activities.slice(0, 50));
  } catch (error) {
    console.error('GET convict activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
