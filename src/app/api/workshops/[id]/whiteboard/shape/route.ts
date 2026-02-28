import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopWhiteboardShapes, workshops } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_SHAPE_TYPES = [
  'rectangle',
  'circle',
  'line',
  'text',
  'ellipse',
  'triangle',
  'arrow'
];

interface ShapeData {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  fill?: string;
  stroke?: string;
  [key: string]: unknown;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshopId = params.id;

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

    // Check if workshop exists
    const workshop = await db
      .select()
      .from(workshops)
      .where(eq(workshops.id, parseInt(workshopId)))
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
    const { userId, shapeType, shapeData } = body;

    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        {
          error: 'User ID is required and must be a non-empty string',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate shapeType
    if (!shapeType || !VALID_SHAPE_TYPES.includes(shapeType)) {
      return NextResponse.json(
        {
          error: `Shape type must be one of: ${VALID_SHAPE_TYPES.join(', ')}`,
          code: 'INVALID_SHAPE_TYPE'
        },
        { status: 400 }
      );
    }

    // Validate shapeData is an object
    if (!shapeData || typeof shapeData !== 'object' || Array.isArray(shapeData)) {
      return NextResponse.json(
        {
          error: 'Shape data must be a valid object',
          code: 'INVALID_SHAPE_DATA'
        },
        { status: 400 }
      );
    }

    // Validate coordinates based on shape type
    const data = shapeData as ShapeData;
    const hasBasicCoords = 
      typeof data.x === 'number' && 
      typeof data.y === 'number' && 
      typeof data.width === 'number' && 
      typeof data.height === 'number';

    const hasLineCoords = 
      typeof data.x1 === 'number' && 
      typeof data.y1 === 'number' && 
      typeof data.x2 === 'number' && 
      typeof data.y2 === 'number';

    if (!hasBasicCoords && !hasLineCoords) {
      return NextResponse.json(
        {
          error: 'Shape data must contain valid coordinates (x, y, width, height) or (x1, y1, x2, y2)',
          code: 'MISSING_COORDINATES'
        },
        { status: 400 }
      );
    }

    // Validate optional fill and stroke if provided
    if (data.fill !== undefined && typeof data.fill !== 'string') {
      return NextResponse.json(
        {
          error: 'Fill property must be a string',
          code: 'INVALID_SHAPE_DATA'
        },
        { status: 400 }
      );
    }

    if (data.stroke !== undefined && typeof data.stroke !== 'string') {
      return NextResponse.json(
        {
          error: 'Stroke property must be a string',
          code: 'INVALID_SHAPE_DATA'
        },
        { status: 400 }
      );
    }

    // Insert new shape
    const newShape = await db
      .insert(workshopWhiteboardShapes)
      .values({
        workshopId: parseInt(workshopId),
        userId: userId.trim(),
        shapeType,
        shapeData: JSON.stringify(shapeData),
        createdAt: new Date().toISOString()
      })
      .returning();

    // Parse shapeData back to object for response
    const response = {
      ...newShape[0],
      shapeData: JSON.parse(newShape[0].shapeData as string)
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message
      },
      { status: 500 }
    );
  }
}