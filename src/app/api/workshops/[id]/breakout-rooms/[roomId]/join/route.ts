import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopBreakoutAssignments, workshopBreakoutRooms, workshops } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; roomId: string } }
) {
  try {
    const { id, roomId } = params;

    // Validate workshop ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID'
        },
        { status: 400 }
      );
    }

    // Validate room ID
    if (!roomId || isNaN(parseInt(roomId))) {
      return NextResponse.json(
        { 
          error: 'Valid room ID is required',
          code: 'INVALID_ROOM_ID'
        },
        { status: 400 }
      );
    }

    const workshopId = parseInt(id);
    const breakoutRoomId = parseInt(roomId);

    // Parse request body
    const body = await request.json();
    const { userId } = body;

    // Validate userId is provided
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate breakout room exists and belongs to this workshop
    const room = await db.select()
      .from(workshopBreakoutRooms)
      .where(
        and(
          eq(workshopBreakoutRooms.id, breakoutRoomId),
          eq(workshopBreakoutRooms.workshopId, workshopId)
        )
      )
      .limit(1);

    if (room.length === 0) {
      return NextResponse.json(
        { 
          error: 'Breakout room not found or does not belong to this workshop',
          code: 'ROOM_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Validate room is active
    if (room[0].status !== 'active') {
      return NextResponse.json(
        { 
          error: 'Breakout room is not active',
          code: 'ROOM_NOT_ACTIVE'
        },
        { status: 400 }
      );
    }

    // Check if user already has an active assignment in this room
    const existingAssignment = await db.select()
      .from(workshopBreakoutAssignments)
      .where(
        and(
          eq(workshopBreakoutAssignments.breakoutRoomId, breakoutRoomId),
          eq(workshopBreakoutAssignments.userId, userId.trim()),
          isNull(workshopBreakoutAssignments.leftAt)
        )
      )
      .limit(1);

    if (existingAssignment.length > 0) {
      return NextResponse.json(
        { 
          error: 'User is already in this breakout room',
          code: 'ALREADY_IN_ROOM'
        },
        { status: 400 }
      );
    }

    // Create new assignment
    const newAssignment = await db.insert(workshopBreakoutAssignments)
      .values({
        breakoutRoomId,
        userId: userId.trim(),
        assignedAt: new Date().toISOString(),
        leftAt: null,
      })
      .returning();

    return NextResponse.json(newAssignment[0], { status: 201 });

  } catch (error) {
    console.error('POST /api/workshops/[id]/breakout-rooms/[roomId]/join error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}