import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopWhiteboardStrokes, workshops } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshopId = params.id;

    // Validate workshop ID is valid integer
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID' 
        },
        { status: 400 }
      );
    }

    const parsedWorkshopId = parseInt(workshopId);

    // Verify workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, parsedWorkshopId))
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

    // Parse request body
    const body = await request.json();
    const { userId, strokeData } = body;

    // Validate userId is provided and non-empty
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'User ID is required and must be a non-empty string',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate strokeData is an object
    if (!strokeData || typeof strokeData !== 'object' || Array.isArray(strokeData)) {
      return NextResponse.json(
        { 
          error: 'Stroke data is required and must be an object',
          code: 'INVALID_STROKE_DATA' 
        },
        { status: 400 }
      );
    }

    // Validate strokeData.path is array with at least 2 points
    if (!Array.isArray(strokeData.path) || strokeData.path.length < 2) {
      return NextResponse.json(
        { 
          error: 'Path must be an array with at least 2 points',
          code: 'INVALID_PATH' 
        },
        { status: 400 }
      );
    }

    // Validate strokeData.color is non-empty string
    if (!strokeData.color || typeof strokeData.color !== 'string' || strokeData.color.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Color is required and must be a non-empty string',
          code: 'INVALID_STROKE_DATA' 
        },
        { status: 400 }
      );
    }

    // Validate strokeData.width is positive number
    if (typeof strokeData.width !== 'number' || strokeData.width <= 0) {
      return NextResponse.json(
        { 
          error: 'Width must be a positive number',
          code: 'INVALID_WIDTH' 
        },
        { status: 400 }
      );
    }

    // Validate strokeData.opacity is number between 0 and 1
    if (typeof strokeData.opacity !== 'number' || strokeData.opacity < 0 || strokeData.opacity > 1) {
      return NextResponse.json(
        { 
          error: 'Opacity must be a number between 0 and 1',
          code: 'INVALID_OPACITY' 
        },
        { status: 400 }
      );
    }

    // Create new stroke with validated data
    const newStroke = await db.insert(workshopWhiteboardStrokes)
      .values({
        workshopId: parsedWorkshopId,
        userId: userId.trim(),
        strokeData: strokeData,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newStroke[0], { status: 201 });

  } catch (error) {
    console.error('POST whiteboard stroke error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}