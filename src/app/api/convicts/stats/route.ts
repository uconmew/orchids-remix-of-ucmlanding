import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transitBookings, volunteerTimeEntries, donations, outreachRegistrations, bridgeActivityLog, workshopRegistrations, prayers } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, sql, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Total Transit Rides Completed
    const ridesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(transitBookings)
      .where(and(
        eq(transitBookings.userId, currentUser.id),
        eq(transitBookings.status, 'completed')
      ));
    
    // 2. Total Volunteer Hours
    const hoursResult = await db
      .select({ total: sql<number>`sum(${volunteerTimeEntries.totalHours})` })
      .from(volunteerTimeEntries)
      .where(eq(volunteerTimeEntries.volunteerId, currentUser.id));

    // 3. Total Donations
    const donationsResult = await db
      .select({ total: sql<number>`sum(${donations.amount})` })
      .from(donations)
      .where(and(
        eq(donations.donorEmail, currentUser.email),
        eq(donations.status, 'succeeded')
      ));

    // 4. Total Bridge Connections
    // Count both registrations for 'bridge' and activity logs as mentor/mentee
    const bridgeRegistrations = await db
      .select({ count: sql<number>`count(*)` })
      .from(outreachRegistrations)
      .where(and(
        eq(outreachRegistrations.userId, currentUser.id),
        eq(outreachRegistrations.serviceId, 'bridge')
      ));

    const bridgeActivity = await db
      .select({ count: sql<number>`count(*)` })
      .from(bridgeActivityLog)
      .where(or(
        eq(bridgeActivityLog.mentorId, currentUser.id),
        sql`${bridgeActivityLog.menteeName} = ${currentUser.name}`
      ));

    // 5. Workshops Attended
    const workshopsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(workshopRegistrations)
      .where(and(
        eq(workshopRegistrations.userId, currentUser.id),
        sql`${workshopRegistrations.attendedAt} IS NOT NULL`
      ));

    // 6. Prayers Requested
    const prayersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(prayers)
      .where(sql`${prayers.name} = ${currentUser.name}`);

    return NextResponse.json({
      transitRides: ridesResult[0]?.count || 0,
      volunteerHours: hoursResult[0]?.total || 0,
      totalDonations: (donationsResult[0]?.total || 0) / 100, // Convert from cents
      bridgeConnections: (bridgeRegistrations[0]?.count || 0) + (bridgeActivity[0]?.count || 0),
      workshopsAttended: workshopsResult[0]?.count || 0,
      prayersRequested: prayersResult[0]?.count || 0
    });
  } catch (error) {
    console.error('Error fetching convict stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
