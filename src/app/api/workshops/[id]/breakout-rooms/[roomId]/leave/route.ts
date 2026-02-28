import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopBreakoutAssignments, workshopBreakoutRooms, workshops } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; roomId: string } }
) {
  try {
    const workshopId = params.id;
    const roomId = params.roomId;

    // Validate workshop ID
    if (!workshopId || isNaN(parseInt(workshopId))) {
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

    // Parse request body
    const body = await request.json();
    const { userId } = body;

    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    const workshopIdInt = parseInt(workshopId);
    const roomIdInt = parseInt(roomId);

    // Validate workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, workshopIdInt))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json(
        { 
          error: 'Workshop not found',
          code: 'WORKSHOP_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Validate breakout room exists and belongs to this workshop
    const room = await db.select()
      .from(workshopBreakoutRooms)
      .where(
        and(
          eq(workshopBreakoutRooms.id, roomIdInt),
          eq(workshopBreakoutRooms.workshopId, workshopIdInt)
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

    // Find active assignment for this user in this room (leftAt IS NULL)
    const activeAssignment = await db.select()
      .from(workshopBreakoutAssignments)
      .where(
        and(
          eq(workshopBreakoutAssignments.breakoutRoomId, roomIdInt),
          eq(workshopBreakoutAssignments.userId, userId),
          isNull(workshopBreakoutAssignments.leftAt)
        )
      )
      .limit(1);

    if (activeAssignment.length === 0) {
      return NextResponse.json(
        { 
          error: 'User is not currently in this breakout room',
          code: 'NOT_IN_ROOM' 
        },
        { status: 404 }
      );
    }

    // Update assignment to mark user as having left
    const updatedAssignment = await db.update(workshopBreakoutAssignments)
      .set({
        leftAt: new Date().toISOString()
      })
      .where(eq(workshopBreakoutAssignments.id, activeAssignment[0].id))
      .returning();

    return NextResponse.json({
      message: 'Successfully left breakout room',
      assignment: updatedAssignment[0]
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}