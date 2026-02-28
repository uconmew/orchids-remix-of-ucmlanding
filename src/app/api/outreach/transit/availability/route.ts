import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transitConstraints, transitBookings } from '@/db/schema';
import { eq, and, or, sql } from 'drizzle-orm';

// Default transit operating parameters
const DEFAULT_START_TIME = "04:00"; // 4 AM
const DEFAULT_END_TIME = "22:00";   // 10 PM
const DEFAULT_CAPACITY = 20;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // Optional: check specific date

    // Get all constraints
    const constraints = await db
      .select()
      .from(transitConstraints);

    // Return availability info
    const response = {
      defaults: {
        startTime: DEFAULT_START_TIME,
        endTime: DEFAULT_END_TIME,
        capacity: DEFAULT_CAPACITY,
      },
      constraints: constraints.map(c => ({
        id: c.id,
        type: c.constraintType,
        dayOfWeek: c.dayOfWeek,
        specificDate: c.specificDate,
        startTime: c.startTime,
        endTime: c.endTime,
        maxCapacity: c.maxCapacity,
        reason: c.reason,
        requiresOverride: c.requiresOverride,
      })),
    };

    // If a specific date is requested, calculate availability for that date
    if (date) {
      const checkDate = new Date(date);
      const dayOfWeek = checkDate.getDay();
      const dateStr = checkDate.toISOString().split('T')[0];

      // Find applicable constraints
      const applicableConstraints = constraints.filter(c => 
        c.specificDate === dateStr || c.dayOfWeek === dayOfWeek
      );

      // Check if closed
      const isClosed = applicableConstraints.some(c => 
        c.constraintType === 'closed' || c.constraintType === 'unavailable'
      );

      // Get effective hours
      const reducedHours = applicableConstraints.find(c => c.constraintType === 'reduced_hours');
      const effectiveStart = reducedHours?.startTime || DEFAULT_START_TIME;
      const effectiveEnd = reducedHours?.endTime || DEFAULT_END_TIME;

      // Get effective capacity
      const reducedCapacity = applicableConstraints.find(c => c.constraintType === 'reduced_capacity');
      const effectiveCapacity = reducedCapacity?.maxCapacity || DEFAULT_CAPACITY;

      // Count approved bookings for that day
      const startOfDay = new Date(checkDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(checkDate);
      endOfDay.setHours(23, 59, 59, 999);

      const approvedBookingsCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(transitBookings)
        .where(and(
          eq(transitBookings.status, 'approved'),
          sql`${transitBookings.requestedTime}::timestamp >= ${startOfDay.toISOString()}::timestamp`,
          sql`${transitBookings.requestedTime}::timestamp <= ${endOfDay.toISOString()}::timestamp`
        ));

      const bookedCount = approvedBookingsCount[0]?.count || 0;
      const availableSlots = effectiveCapacity - bookedCount;

      return NextResponse.json({
        ...response,
        dateCheck: {
          date: dateStr,
          dayOfWeek,
          isOpen: !isClosed,
          effectiveHours: { start: effectiveStart, end: effectiveEnd },
          effectiveCapacity,
          bookedCount,
          availableSlots: Math.max(0, availableSlots),
          applicableConstraints: applicableConstraints.map(c => ({
            type: c.constraintType,
            reason: c.reason,
            requiresOverride: c.requiresOverride,
          })),
        },
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching transit availability:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
