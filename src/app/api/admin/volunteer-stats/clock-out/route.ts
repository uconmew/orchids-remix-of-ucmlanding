import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { volunteerTimeEntries } from '@/db/schema';
import { eq, isNull } from 'drizzle-orm';

// PATCH: Clock out volunteer (update existing time entry)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryId, clockOut } = body;

    if (!entryId) {
      return NextResponse.json(
        { error: 'Missing required field: entryId' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const clockOutTime = clockOut || now;

    // Get the time entry
    const entry = await db
      .select()
      .from(volunteerTimeEntries)
      .where(eq(volunteerTimeEntries.id, entryId))
      .limit(1);

    if (entry.length === 0) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      );
    }

    if (entry[0].clockOut) {
      return NextResponse.json(
        { error: 'This time entry has already been clocked out' },
        { status: 400 }
      );
    }

    // Calculate total hours
    const clockInTime = new Date(entry[0].clockIn);
    const clockOutTimeDate = new Date(clockOutTime);
    const totalHours = (clockOutTimeDate.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    // Update the time entry
    const result = await db
      .update(volunteerTimeEntries)
      .set({
        clockOut: clockOutTime,
        totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
        updatedAt: now,
      })
      .where(eq(volunteerTimeEntries.id, entryId))
      .returning();

    return NextResponse.json({ 
      success: true, 
      message: 'Clocked out successfully',
      data: result[0]
    }, { status: 200 });

  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      {
        error: 'Failed to clock out: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

// GET: Get all active (not clocked out) time entries
export async function GET(request: NextRequest) {
  try {
    const activeEntries = await db
      .select()
      .from(volunteerTimeEntries)
      .where(isNull(volunteerTimeEntries.clockOut));

    return NextResponse.json({ 
      success: true,
      count: activeEntries.length,
      data: activeEntries
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve active entries: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}
