import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopBreakoutRooms, workshopBreakoutAssignments, workshops } from '@/db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const includeAssignments = searchParams.get('includeAssignments') === 'true';

    // Validate workshop ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_WORKSHOP_ID' },
        { status: 400 }
      );
    }

    const workshopId = parseInt(id);

    // Validate workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, workshopId))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get breakout rooms ordered by room number
    const rooms = await db.select()
      .from(workshopBreakoutRooms)
      .where(eq(workshopBreakoutRooms.workshopId, workshopId))
      .orderBy(workshopBreakoutRooms.roomNumber);

    // If includeAssignments is true, fetch active assignments for each room
    if (includeAssignments) {
      const roomsWithAssignments = await Promise.all(
        rooms.map(async (room) => {
          const assignments = await db.select()
            .from(workshopBreakoutAssignments)
            .where(
              and(
                eq(workshopBreakoutAssignments.breakoutRoomId, room.id),
                isNull(workshopBreakoutAssignments.leftAt)
              )
            );

          return {
            ...room,
            assignments
          };
        })
      );

      return NextResponse.json(roomsWithAssignments, { status: 200 });
    }

    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.error('GET breakout rooms error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate workshop ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_WORKSHOP_ID' },
        { status: 400 }
      );
    }

    const workshopId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { hostUserId, roomCount, maxParticipants } = body;

    // Validate required fields
    if (!hostUserId) {
      return NextResponse.json(
        { error: 'Host user ID is required', code: 'MISSING_HOST_USER_ID' },
        { status: 400 }
      );
    }

    if (!roomCount || typeof roomCount !== 'number') {
      return NextResponse.json(
        { error: 'Room count is required and must be a number', code: 'INVALID_ROOM_COUNT' },
        { status: 400 }
      );
    }

    // Validate room count range
    if (roomCount < 2 || roomCount > 20) {
      return NextResponse.json(
        { error: 'Room count must be between 2 and 20', code: 'INVALID_ROOM_COUNT' },
        { status: 400 }
      );
    }

    // Validate workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, workshopId))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate host authorization
    if (workshop[0].hostUserId !== hostUserId) {
      return NextResponse.json(
        { error: 'Only the workshop host can create breakout rooms', code: 'UNAUTHORIZED_HOST' },
        { status: 403 }
      );
    }

    // Create breakout rooms
    const createdRooms = [];
    const currentTimestamp = new Date().toISOString();

    for (let i = 1; i <= roomCount; i++) {
      const roomData = {
        workshopId,
        roomName: `Breakout Room ${i}`,
        roomNumber: i,
        maxParticipants: maxParticipants || null,
        status: 'active',
        createdAt: currentTimestamp
      };

      const newRoom = await db.insert(workshopBreakoutRooms)
        .values(roomData)
        .returning();

      createdRooms.push(newRoom[0]);
    }

    return NextResponse.json(createdRooms, { status: 201 });
  } catch (error) {
    console.error('POST breakout rooms error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const hostUserId = searchParams.get('hostUserId');

    // Validate workshop ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_WORKSHOP_ID' },
        { status: 400 }
      );
    }

    const workshopId = parseInt(id);

    // Validate host user ID provided
    if (!hostUserId) {
      return NextResponse.json(
        { error: 'Host user ID is required', code: 'MISSING_HOST_USER_ID' },
        { status: 400 }
      );
    }

    // Validate workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, workshopId))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate host authorization
    if (workshop[0].hostUserId !== hostUserId) {
      return NextResponse.json(
        { error: 'Only the workshop host can close breakout rooms', code: 'UNAUTHORIZED_HOST' },
        { status: 403 }
      );
    }

    const currentTimestamp = new Date().toISOString();

    // Get all breakout rooms for this workshop
    const rooms = await db.select()
      .from(workshopBreakoutRooms)
      .where(eq(workshopBreakoutRooms.workshopId, workshopId));

    // Close all breakout rooms
    const closedRooms = await db.update(workshopBreakoutRooms)
      .set({ status: 'closed' })
      .where(eq(workshopBreakoutRooms.workshopId, workshopId))
      .returning();

    // Update all active assignments (set leftAt timestamp)
    let updatedAssignmentsCount = 0;
    
    for (const room of rooms) {
      const updated = await db.update(workshopBreakoutAssignments)
        .set({ leftAt: currentTimestamp })
        .where(
          and(
            eq(workshopBreakoutAssignments.breakoutRoomId, room.id),
            isNull(workshopBreakoutAssignments.leftAt)
          )
        )
        .returning();
      
      updatedAssignmentsCount += updated.length;
    }

    return NextResponse.json(
      {
        message: 'All breakout rooms closed successfully',
        closedRooms: closedRooms.length,
        updatedAssignments: updatedAssignmentsCount
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE breakout rooms error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}