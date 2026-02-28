import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopTypes } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const workshopType = await db
        .select()
        .from(workshopTypes)
        .where(eq(workshopTypes.id, parseInt(id)))
        .limit(1);

      if (workshopType.length === 0) {
        return NextResponse.json(
          { error: 'Workshop type not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(workshopType[0], { status: 200 });
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const category = searchParams.get('category');

    let query = db.select().from(workshopTypes);

    // Filter by category if provided
    if (category) {
      query = query.where(eq(workshopTypes.category, category));
    }

    const results = await query
      .orderBy(desc(workshopTypes.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, defaultMaxParticipants, defaultDuration, category } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    // Validate optional numeric fields if provided
    if (defaultMaxParticipants !== undefined && (typeof defaultMaxParticipants !== 'number' || defaultMaxParticipants <= 0)) {
      return NextResponse.json(
        { error: 'defaultMaxParticipants must be a positive number', code: 'INVALID_MAX_PARTICIPANTS' },
        { status: 400 }
      );
    }

    if (defaultDuration !== undefined && (typeof defaultDuration !== 'number' || defaultDuration <= 0)) {
      return NextResponse.json(
        { error: 'defaultDuration must be a positive number', code: 'INVALID_DURATION' },
        { status: 400 }
      );
    }

    // Prepare insert data with defaults and system fields
    const insertData = {
      name: name.trim(),
      description: description ? description.trim() : null,
      defaultMaxParticipants: defaultMaxParticipants ?? 10,
      defaultDuration: defaultDuration ?? 60,
      category: category ? category.trim() : null,
      createdAt: new Date().toISOString(),
    };

    const newWorkshopType = await db
      .insert(workshopTypes)
      .values(insertData)
      .returning();

    return NextResponse.json(newWorkshopType[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(workshopTypes)
      .where(eq(workshopTypes.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Workshop type not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, defaultMaxParticipants, defaultDuration, category } = body;

    // Validate fields if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    if (defaultMaxParticipants !== undefined && (typeof defaultMaxParticipants !== 'number' || defaultMaxParticipants <= 0)) {
      return NextResponse.json(
        { error: 'defaultMaxParticipants must be a positive number', code: 'INVALID_MAX_PARTICIPANTS' },
        { status: 400 }
      );
    }

    if (defaultDuration !== undefined && (typeof defaultDuration !== 'number' || defaultDuration <= 0)) {
      return NextResponse.json(
        { error: 'defaultDuration must be a positive number', code: 'INVALID_DURATION' },
        { status: 400 }
      );
    }

    // Prepare update data (only include provided fields)
    const updateData: Record<string, any> = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (defaultMaxParticipants !== undefined) updateData.defaultMaxParticipants = defaultMaxParticipants;
    if (defaultDuration !== undefined) updateData.defaultDuration = defaultDuration;
    if (category !== undefined) updateData.category = category ? category.trim() : null;

    const updated = await db
      .update(workshopTypes)
      .set(updateData)
      .where(eq(workshopTypes.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
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

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(workshopTypes)
      .where(eq(workshopTypes.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Workshop type not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(workshopTypes)
      .where(eq(workshopTypes.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Workshop type deleted successfully',
        deletedRecord: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}