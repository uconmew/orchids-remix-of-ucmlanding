import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopWhiteboardStrokes, workshopWhiteboardShapes, workshops } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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

    const workshopId = parseInt(id);

    // Validate workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, workshopId))
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

    // Get all strokes for this workshop (ordered by creation time)
    const strokes = await db.select()
      .from(workshopWhiteboardStrokes)
      .where(eq(workshopWhiteboardStrokes.workshopId, workshopId))
      .orderBy(asc(workshopWhiteboardStrokes.createdAt));

    // Get all shapes for this workshop (ordered by creation time)
    const shapes = await db.select()
      .from(workshopWhiteboardShapes)
      .where(eq(workshopWhiteboardShapes.workshopId, workshopId))
      .orderBy(asc(workshopWhiteboardShapes.createdAt));

    return NextResponse.json({
      strokes,
      shapes
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const hostUserId = searchParams.get('hostUserId');

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

    // Validate hostUserId is provided
    if (!hostUserId) {
      return NextResponse.json(
        { 
          error: 'Host user ID is required',
          code: 'MISSING_HOST_USER_ID'
        },
        { status: 400 }
      );
    }

    const workshopId = parseInt(id);

    // Validate workshop exists and get host information
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, workshopId))
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

    // Verify the user is the workshop host
    if (workshop[0].hostUserId !== hostUserId) {
      return NextResponse.json(
        { 
          error: 'Only the workshop host can clear the whiteboard',
          code: 'UNAUTHORIZED_HOST'
        },
        { status: 403 }
      );
    }

    // Delete all strokes for this workshop
    const deletedStrokes = await db.delete(workshopWhiteboardStrokes)
      .where(eq(workshopWhiteboardStrokes.workshopId, workshopId))
      .returning();

    // Delete all shapes for this workshop
    const deletedShapes = await db.delete(workshopWhiteboardShapes)
      .where(eq(workshopWhiteboardShapes.workshopId, workshopId))
      .returning();

    return NextResponse.json({
      message: 'Whiteboard cleared successfully',
      deletedStrokes: deletedStrokes.length,
      deletedShapes: deletedShapes.length
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}