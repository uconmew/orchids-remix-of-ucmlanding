import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { volunteerStats, volunteerTimeEntries } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';

// GET: Retrieve current volunteer stats
export async function GET(request: NextRequest) {
  try {
    const stats = await db
      .select()
      .from(volunteerStats)
      .orderBy(sql`${volunteerStats.lastUpdated} DESC`)
      .limit(1);

    if (stats.length === 0) {
      return NextResponse.json(
        { error: 'No volunteer stats found' },
        { status: 404 }
      );
    }

    return NextResponse.json(stats[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve stats: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

// POST: Create time entry (for future time clock system)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { volunteerId, volunteerName, activityType, notes, clockIn } = body;

    if (!volunteerId || !volunteerName || !activityType) {
      return NextResponse.json(
        { error: 'Missing required fields: volunteerId, volunteerName, activityType' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    
    const result = await db
      .insert(volunteerTimeEntries)
      .values({
        volunteerId,
        volunteerName,
        clockIn: clockIn || now,
        activityType,
        notes: notes || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      message: 'Time entry created',
      data: result[0]
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create time entry: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

// PATCH: Update volunteer stats (for manual updates)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { activeVolunteers, hoursDonated, partnerChurches } = body;

    if (!activeVolunteers && !hoursDonated && !partnerChurches) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Get the current stats
    const currentStats = await db
      .select()
      .from(volunteerStats)
      .orderBy(sql`${volunteerStats.lastUpdated} DESC`)
      .limit(1);

    if (currentStats.length === 0) {
      return NextResponse.json(
        { error: 'No volunteer stats found to update' },
        { status: 404 }
      );
    }

    // Update the stats
    const updateData: any = { lastUpdated: now };
    if (activeVolunteers !== undefined) updateData.activeVolunteers = activeVolunteers;
    if (hoursDonated !== undefined) updateData.hoursDonated = hoursDonated;
    if (partnerChurches !== undefined) updateData.partnerChurches = partnerChurches;

    const result = await db
      .update(volunteerStats)
      .set(updateData)
      .where(eq(volunteerStats.id, currentStats[0].id))
      .returning();

    return NextResponse.json({ 
      success: true, 
      message: 'Stats updated successfully',
      data: result[0]
    }, { status: 200 });

  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update stats: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}
