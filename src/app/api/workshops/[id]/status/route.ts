import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshops } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_STATUSES = ['scheduled', 'live', 'completed', 'cancelled'];
const LIVE_START_TOLERANCE_MINUTES = 30;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id);

    // Check if workshop exists
    const existingWorkshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, parsedId))
      .limit(1);

    if (existingWorkshop.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      );
    }

    const workshop = existingWorkshop[0];

    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status is required
    if (!status) {
      return NextResponse.json(
        { 
          error: "Status is required",
          code: "MISSING_STATUS" 
        },
        { status: 400 }
      );
    }

    // Validate status is one of valid values
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
          code: "INVALID_STATUS" 
        },
        { status: 400 }
      );
    }

    // Additional validation for status transitions
    const currentTime = new Date();

    // If changing to 'live', validate startTime is close to current time
    if (status === 'live' && workshop.startTime) {
      const startTime = new Date(workshop.startTime);
      const timeDifferenceMinutes = Math.abs(currentTime.getTime() - startTime.getTime()) / (1000 * 60);

      if (timeDifferenceMinutes > LIVE_START_TOLERANCE_MINUTES) {
        return NextResponse.json(
          { 
            error: `Cannot set status to 'live'. Start time must be within ${LIVE_START_TOLERANCE_MINUTES} minutes of current time`,
            code: "INVALID_LIVE_TIMING" 
          },
          { status: 400 }
        );
      }
    }

    // If changing to 'completed', validate current time is after startTime
    if (status === 'completed' && workshop.startTime) {
      const startTime = new Date(workshop.startTime);

      if (currentTime < startTime) {
        return NextResponse.json(
          { 
            error: "Cannot set status to 'completed'. Current time must be after the workshop start time",
            code: "INVALID_COMPLETED_TIMING" 
          },
          { status: 400 }
        );
      }
    }

    // Update workshop status
    const updated = await db.update(workshops)
      .set({
        status,
        updatedAt: new Date().toISOString()
      })
      .where(eq(workshops.id, parsedId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update workshop' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id);

    // Check if workshop exists
    const existingWorkshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, parsedId))
      .limit(1);

    if (existingWorkshop.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      );
    }

    const workshop = existingWorkshop[0];

    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status is required
    if (!status) {
      return NextResponse.json(
        { 
          error: "Status is required",
          code: "MISSING_STATUS" 
        },
        { status: 400 }
      );
    }

    // Validate status is one of valid values
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
          code: "INVALID_STATUS" 
        },
        { status: 400 }
      );
    }

    // Additional validation for status transitions
    const currentTime = new Date();

    // If changing to 'live', validate startTime is close to current time
    if (status === 'live' && workshop.startTime) {
      const startTime = new Date(workshop.startTime);
      const timeDifferenceMinutes = Math.abs(currentTime.getTime() - startTime.getTime()) / (1000 * 60);

      if (timeDifferenceMinutes > LIVE_START_TOLERANCE_MINUTES) {
        return NextResponse.json(
          { 
            error: `Cannot set status to 'live'. Start time must be within ${LIVE_START_TOLERANCE_MINUTES} minutes of current time`,
            code: "INVALID_LIVE_TIMING" 
          },
          { status: 400 }
        );
      }
    }

    // If changing to 'completed', validate current time is after startTime
    if (status === 'completed' && workshop.startTime) {
      const startTime = new Date(workshop.startTime);

      if (currentTime < startTime) {
        return NextResponse.json(
          { 
            error: "Cannot set status to 'completed'. Current time must be after the workshop start time",
            code: "INVALID_COMPLETED_TIMING" 
          },
          { status: 400 }
        );
      }
    }

    // Update workshop status
    const updated = await db.update(workshops)
      .set({
        status,
        updatedAt: new Date().toISOString()
      })
      .where(eq(workshops.id, parsedId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update workshop' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}