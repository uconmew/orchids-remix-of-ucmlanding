import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshops } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const workshop = await db
      .select()
      .from(workshops)
      .where(and(eq(workshops.id, parseInt(id)), eq(workshops.userId, user.id)))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(workshop[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const existingWorkshop = await db
      .select()
      .from(workshops)
      .where(and(eq(workshops.id, parseInt(id)), eq(workshops.userId, user.id)))
      .limit(1);

    if (existingWorkshop.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    const allowedFields = [
      'title',
      'description',
      'startTime',
      'endTime',
      'durationMinutes',
      'maxParticipants',
      'status',
      'category',
      'programType',
      'imageUrl',
      'isFeatured',
    ];

    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (updates.status) {
      const validStatuses = ['scheduled', 'live', 'completed', 'cancelled'];
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json(
          {
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
    }

    // Validate programType if provided
    if (updates.programType) {
      if (updates.programType !== 'awaken' && updates.programType !== 'equip') {
        return NextResponse.json(
          {
            error: 'programType must be "awaken" or "equip"',
            code: 'INVALID_PROGRAM_TYPE',
          },
          { status: 400 }
        );
      }
    }

    const startTime = updates.startTime || existingWorkshop[0].startTime;
    const endTime = updates.endTime || existingWorkshop[0].endTime;

    if (updates.startTime) {
      const startDate = new Date(updates.startTime);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid startTime format', code: 'INVALID_START_TIME' },
          { status: 400 }
        );
      }
    }

    if (updates.endTime) {
      const endDate = new Date(updates.endTime);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid endTime format', code: 'INVALID_END_TIME' },
          { status: 400 }
        );
      }
    }

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (end <= start) {
        return NextResponse.json(
          {
            error: 'End time must be after start time',
            code: 'INVALID_TIME_RANGE',
          },
          { status: 400 }
        );
      }

      if (updates.startTime || updates.endTime) {
        const durationMs = end.getTime() - start.getTime();
        updates.durationMinutes = Math.floor(durationMs / (1000 * 60));
      }
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await db
      .update(workshops)
      .set(updates)
      .where(and(eq(workshops.id, parseInt(id)), eq(workshops.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingWorkshop = await db
      .select()
      .from(workshops)
      .where(and(eq(workshops.id, parseInt(id)), eq(workshops.userId, user.id)))
      .limit(1);

    if (existingWorkshop.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(workshops)
      .where(and(eq(workshops.id, parseInt(id)), eq(workshops.userId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Workshop deleted successfully',
        workshop: deleted[0],
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const existingWorkshop = await db
      .select()
      .from(workshops)
      .where(and(eq(workshops.id, parseInt(id)), eq(workshops.userId, user.id)))
      .limit(1);

    if (existingWorkshop.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updates: Record<string, any> = { ...body };
    updates.updatedAt = new Date().toISOString();

    const updated = await db
      .update(workshops)
      .set(updates)
      .where(and(eq(workshops.id, parseInt(id)), eq(workshops.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}