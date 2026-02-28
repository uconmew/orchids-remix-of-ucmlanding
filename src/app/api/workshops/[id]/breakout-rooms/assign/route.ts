import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopBreakoutAssignments, workshopBreakoutRooms, workshops } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Extract workshop ID from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const workshopIdIndex = pathParts.indexOf('workshops') + 1;
    const id = pathParts[workshopIdIndex];

    // Validate workshop ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid workshop ID is required",
          code: "INVALID_WORKSHOP_ID" 
        },
        { status: 400 }
      );
    }

    const workshopId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { hostUserId, assignments } = body;

    // Validate hostUserId is provided
    if (!hostUserId) {
      return NextResponse.json(
        { 
          error: "Host user ID is required",
          code: "MISSING_HOST_USER_ID" 
        },
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
        { 
          error: "Workshop not found",
          code: "WORKSHOP_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    // Validate user is the workshop host
    if (workshop[0].hostUserId !== hostUserId) {
      return NextResponse.json(
        { 
          error: "Only the workshop host can assign participants to breakout rooms",
          code: "UNAUTHORIZED_HOST" 
        },
        { status: 403 }
      );
    }

    // Validate assignments array
    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json(
        { 
          error: "Assignments array is required and must not be empty",
          code: "MISSING_ASSIGNMENTS" 
        },
        { status: 400 }
      );
    }

    // Validate each assignment has required fields
    for (const assignment of assignments) {
      if (!assignment.userId || !assignment.breakoutRoomId) {
        return NextResponse.json(
          { 
            error: "Each assignment must have userId and breakoutRoomId",
            code: "INVALID_ASSIGNMENT_DATA" 
          },
          { status: 400 }
        );
      }
    }

    // Extract all breakout room IDs for validation
    const breakoutRoomIds = [...new Set(assignments.map((a: any) => a.breakoutRoomId))];

    // Validate all breakout rooms exist and belong to this workshop
    const rooms = await db.select()
      .from(workshopBreakoutRooms)
      .where(
        and(
          eq(workshopBreakoutRooms.workshopId, workshopId)
        )
      );

    const validRoomIds = new Set(rooms.map(r => r.id));
    const activeRoomIds = new Set(
      rooms.filter(r => r.status === 'active').map(r => r.id)
    );

    // Check if all requested room IDs exist for this workshop
    for (const roomId of breakoutRoomIds) {
      if (!validRoomIds.has(roomId)) {
        return NextResponse.json(
          { 
            error: `Breakout room with ID ${roomId} not found for this workshop`,
            code: "ROOM_NOT_FOUND" 
          },
          { status: 404 }
        );
      }

      if (!activeRoomIds.has(roomId)) {
        return NextResponse.json(
          { 
            error: `Breakout room with ID ${roomId} is not active`,
            code: "ROOM_NOT_ACTIVE" 
          },
          { status: 400 }
        );
      }
    }

    // Process assignments
    const createdAssignments = [];
    const currentTimestamp = new Date().toISOString();

    for (const assignment of assignments) {
      const { userId, breakoutRoomId } = assignment;

      // Check if user has existing active assignment in ANY room of this workshop
      const existingAssignments = await db.select({
        id: workshopBreakoutAssignments.id,
        breakoutRoomId: workshopBreakoutAssignments.breakoutRoomId,
        roomWorkshopId: workshopBreakoutRooms.workshopId
      })
        .from(workshopBreakoutAssignments)
        .innerJoin(
          workshopBreakoutRooms,
          eq(workshopBreakoutAssignments.breakoutRoomId, workshopBreakoutRooms.id)
        )
        .where(
          and(
            eq(workshopBreakoutAssignments.userId, userId),
            eq(workshopBreakoutRooms.workshopId, workshopId),
            isNull(workshopBreakoutAssignments.leftAt)
          )
        );

      // If user has active assignment, mark it as left
      if (existingAssignments.length > 0) {
        for (const existing of existingAssignments) {
          await db.update(workshopBreakoutAssignments)
            .set({
              leftAt: currentTimestamp
            })
            .where(eq(workshopBreakoutAssignments.id, existing.id));
        }
      }

      // Create new assignment
      const newAssignment = await db.insert(workshopBreakoutAssignments)
        .values({
          breakoutRoomId: breakoutRoomId,
          userId: userId,
          assignedAt: currentTimestamp,
          leftAt: null
        })
        .returning();

      createdAssignments.push(newAssignment[0]);
    }

    return NextResponse.json(createdAssignments, { status: 201 });

  } catch (error) {
    console.error('POST breakout assignment error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}