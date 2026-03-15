import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshops, workshopParticipants } from '@/db/schema';
import { eq, like, and, or, desc, asc, gte, lte, isNull, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single workshop by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const workshop = await db.select({
        id: workshops.id,
        title: workshops.title,
        description: workshops.description,
        hostUserId: workshops.hostUserId,
        startTime: workshops.startTime,
        endTime: workshops.endTime,
        durationMinutes: workshops.durationMinutes,
        maxParticipants: workshops.maxParticipants,
        currentParticipants: sql<number>`(
          SELECT COUNT(*) 
          FROM workshop_participants 
          WHERE workshop_participants.workshop_id = workshops.id 
          AND workshop_participants.left_at IS NULL
          AND (workshop_participants.status = 'active' OR workshop_participants.status = 'waiting')
        )`,
        status: workshops.status,
        meetingRoomId: workshops.meetingRoomId,
        category: workshops.category,
        programType: workshops.programType,
        imageUrl: workshops.imageUrl,
        isFeatured: workshops.isFeatured,
        createdAt: workshops.createdAt,
        updatedAt: workshops.updatedAt,
      })
        .from(workshops)
        .where(eq(workshops.id, parseInt(id)))
        .limit(1);

      if (workshop.length === 0) {
        return NextResponse.json({ 
          error: 'Workshop not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(workshop[0], { status: 200 });
    }

    // List workshops with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const programType = searchParams.get('programType');
    const upcoming = searchParams.get('upcoming');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    // Build query with dynamic participant count (includes active AND waiting participants)
    let query = db.select({
      id: workshops.id,
      title: workshops.title,
      description: workshops.description,
      hostUserId: workshops.hostUserId,
      startTime: workshops.startTime,
      endTime: workshops.endTime,
      durationMinutes: workshops.durationMinutes,
      maxParticipants: workshops.maxParticipants,
      currentParticipants: sql<number>`(
        SELECT COUNT(*) 
        FROM workshop_participants 
        WHERE workshop_participants.workshop_id = workshops.id 
        AND workshop_participants.left_at IS NULL
        AND (workshop_participants.status = 'active' OR workshop_participants.status = 'waiting')
      )`,
      status: workshops.status,
      meetingRoomId: workshops.meetingRoomId,
      category: workshops.category,
      programType: workshops.programType,
      imageUrl: workshops.imageUrl,
      isFeatured: workshops.isFeatured,
      createdAt: workshops.createdAt,
      updatedAt: workshops.updatedAt,
    }).from(workshops);

    const conditions = [];

    // Filter by status
    if (status) {
      conditions.push(eq(workshops.status, status));
    }

    // Filter by category
    if (category) {
      conditions.push(eq(workshops.category, category));
    }

    // Filter by programType
    if (programType) {
      if (programType !== 'awaken' && programType !== 'equip') {
        return NextResponse.json({ 
          error: 'Invalid programType. Must be "awaken" or "equip"',
          code: 'INVALID_PROGRAM_TYPE' 
        }, { status: 400 });
      }
      conditions.push(eq(workshops.programType, programType));
    }

    // Filter upcoming workshops
    if (upcoming === 'true') {
      const now = new Date().toISOString();
      conditions.push(
        and(
          gte(workshops.startTime, now),
          eq(workshops.status, 'scheduled')
        )
      );
    }

    // Filter featured workshops
    if (featured === 'true') {
      conditions.push(eq(workshops.isFeatured, true));
    }

    // Search in title
    if (search) {
      conditions.push(like(workshops.title, `%${search}%`));
    }

    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Order by startTime ascending for upcoming, otherwise by createdAt desc
    if (upcoming === 'true') {
      query = query.orderBy(asc(workshops.startTime));
    } else {
      query = query.orderBy(desc(workshops.createdAt));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      hostUserId, 
      startTime, 
      endTime,
      durationMinutes,
      maxParticipants,
      status = 'scheduled',
      meetingRoomId,
      category,
      programType,
      imageUrl,
      isFeatured = false
    } = body;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!description || !description.trim()) {
      return NextResponse.json({ 
        error: "Description is required",
        code: "MISSING_DESCRIPTION" 
      }, { status: 400 });
    }

    if (!hostUserId || !hostUserId.trim()) {
      return NextResponse.json({ 
        error: "Host user ID is required",
        code: "MISSING_HOST_USER_ID" 
      }, { status: 400 });
    }

    if (!startTime || !startTime.trim()) {
      return NextResponse.json({ 
        error: "Start time is required",
        code: "MISSING_START_TIME" 
      }, { status: 400 });
    }

    if (!endTime || !endTime.trim()) {
      return NextResponse.json({ 
        error: "End time is required",
        code: "MISSING_END_TIME" 
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['scheduled', 'live', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: "Status must be one of: scheduled, live, completed, cancelled",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate programType
    if (programType && programType !== 'awaken' && programType !== 'equip') {
      return NextResponse.json({ 
        error: 'programType must be "awaken" or "equip"',
        code: 'INVALID_PROGRAM_TYPE' 
      }, { status: 400 });
    }

    // Validate ISO timestamps
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ 
        error: "Start time must be a valid ISO timestamp",
        code: "INVALID_START_TIME" 
      }, { status: 400 });
    }

    if (isNaN(endDate.getTime())) {
      return NextResponse.json({ 
        error: "End time must be a valid ISO timestamp",
        code: "INVALID_END_TIME" 
      }, { status: 400 });
    }

    // Validate endTime is after startTime
    if (endDate <= startDate) {
      return NextResponse.json({ 
        error: "End time must be after start time",
        code: "INVALID_TIME_RANGE" 
      }, { status: 400 });
    }

    // Auto-calculate durationMinutes if not provided
    const calculatedDurationMinutes = durationMinutes ?? Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

    // Generate unique meetingRoomId if not provided
    const generatedMeetingRoomId = meetingRoomId ?? crypto.randomUUID();

    const now = new Date().toISOString();

    const newWorkshop = await db.insert(workshops)
      .values({
        title: title.trim(),
        description: description.trim(),
        hostUserId: hostUserId.trim(),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        durationMinutes: calculatedDurationMinutes,
        maxParticipants: maxParticipants ?? null,
        currentParticipants: 0,
        status,
        meetingRoomId: generatedMeetingRoomId,
        category: category?.trim() ?? null,
        programType: programType || 'equip',
        imageUrl: imageUrl?.trim() ?? null,
        isFeatured,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newWorkshop[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if workshop exists
    const existing = await db.select()
      .from(workshops)
      .where(eq(workshops.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Workshop not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      startTime, 
      endTime,
      durationMinutes,
      maxParticipants,
      status,
      category,
      programType,
      imageUrl,
      isFeatured
    } = body;

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and add title
    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json({ 
          error: "Title cannot be empty",
          code: "INVALID_TITLE" 
        }, { status: 400 });
      }
      updates.title = title.trim();
    }

    // Validate and add description
    if (description !== undefined) {
      if (!description.trim()) {
        return NextResponse.json({ 
          error: "Description cannot be empty",
          code: "INVALID_DESCRIPTION" 
        }, { status: 400 });
      }
      updates.description = description.trim();
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['scheduled', 'live', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: "Status must be one of: scheduled, live, completed, cancelled",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = status;
    }

    // Validate and add programType
    if (programType !== undefined) {
      if (programType !== 'awaken' && programType !== 'equip') {
        return NextResponse.json({ 
          error: 'programType must be "awaken" or "equip"',
          code: 'INVALID_PROGRAM_TYPE' 
        }, { status: 400 });
      }
      updates.programType = programType;
    }

    // Validate and add startTime
    if (startTime !== undefined) {
      const startDate = new Date(startTime);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json({ 
          error: "Start time must be a valid ISO timestamp",
          code: "INVALID_START_TIME" 
        }, { status: 400 });
      }
      updates.startTime = startDate.toISOString();
    }

    // Validate and add endTime
    if (endTime !== undefined) {
      const endDate = new Date(endTime);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json({ 
          error: "End time must be a valid ISO timestamp",
          code: "INVALID_END_TIME" 
        }, { status: 400 });
      }
      updates.endTime = endDate.toISOString();
    }

    // Validate time range if both dates are being updated
    if (updates.startTime && updates.endTime) {
      if (new Date(updates.endTime) <= new Date(updates.startTime)) {
        return NextResponse.json({ 
          error: "End time must be after start time",
          code: "INVALID_TIME_RANGE" 
        }, { status: 400 });
      }
    }

    // Add other optional fields
    if (durationMinutes !== undefined) {
      updates.durationMinutes = durationMinutes;
    }

    if (maxParticipants !== undefined) {
      updates.maxParticipants = maxParticipants;
    }

    if (category !== undefined) {
      updates.category = category?.trim() ?? null;
    }

    if (imageUrl !== undefined) {
      updates.imageUrl = imageUrl?.trim() ?? null;
    }

    if (isFeatured !== undefined) {
      updates.isFeatured = isFeatured;
    }

    const updated = await db.update(workshops)
      .set(updates)
      .where(eq(workshops.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if workshop exists
    const existing = await db.select()
      .from(workshops)
      .where(eq(workshops.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Workshop not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(workshops)
      .where(eq(workshops.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Workshop deleted successfully',
      workshop: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}