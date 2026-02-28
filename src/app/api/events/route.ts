import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, userRoles, rolePermissions, roles } from '@/db/schema';
import { eq, like, and, or, desc, asc, gte, lte } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const VALID_EVENT_TYPES = ['workshop', 'service', 'outreach', 'meeting'];

async function checkPermission(userId: string, action: string): Promise<boolean> {
  try {
    const userRoleResult = await db.select({
      roleId: userRoles.roleId,
    })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))
      .limit(1);

    if (userRoleResult.length === 0) return false;

    const { roleId } = userRoleResult[0];

    const permissionResult = await db.select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.resource, 'events'),
          eq(rolePermissions.action, action)
        )
      )
      .limit(1);

    return permissionResult.length > 0;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const event = await db
        .select()
        .from(events)
        .where(eq(events.id, parseInt(id)))
        .limit(1);

      if (event.length === 0) {
        return NextResponse.json(
          { error: 'Event not found', code: 'EVENT_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(event[0], { status: 200 });
    }

    // List with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const eventType = searchParams.get('event_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = db.select().from(events);
    const conditions = [];

    // Search by title
    if (search) {
      conditions.push(like(events.title, `%${search}%`));
    }

    // Filter by event type
    if (eventType) {
      if (!VALID_EVENT_TYPES.includes(eventType)) {
        return NextResponse.json(
          { 
            error: 'Invalid event type. Must be one of: workshop, service, outreach, meeting',
            code: 'INVALID_EVENT_TYPE' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(events.eventType, eventType));
    }

    // Filter by date range
    if (startDate) {
      conditions.push(gte(events.startDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(events.startDate, endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(asc(events.startDate))
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
    // Check authentication and permission
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const hasPermission = await checkPermission(session.user.id, 'create');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Permission denied: events.create required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, eventType, startDate, endDate, location, maxAttendees, requiresAuth, imageUrl } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (!eventType || typeof eventType !== 'string') {
      return NextResponse.json(
        { error: 'Event type is required', code: 'MISSING_EVENT_TYPE' },
        { status: 400 }
      );
    }

    if (!VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { 
          error: 'Invalid event type. Must be one of: workshop, service, outreach, meeting',
          code: 'INVALID_EVENT_TYPE' 
        },
        { status: 400 }
      );
    }

    if (!startDate || typeof startDate !== 'string') {
      return NextResponse.json(
        { error: 'Start date is required', code: 'MISSING_START_DATE' },
        { status: 400 }
      );
    }

    // Validate startDate is a valid ISO timestamp
    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Start date must be a valid ISO timestamp', code: 'INVALID_START_DATE' },
        { status: 400 }
      );
    }

    // Validate endDate if provided
    if (endDate) {
      const endDateObj = new Date(endDate);
      if (isNaN(endDateObj.getTime())) {
        return NextResponse.json(
          { error: 'End date must be a valid ISO timestamp', code: 'INVALID_END_DATE' },
          { status: 400 }
        );
      }

      if (endDateObj <= startDateObj) {
        return NextResponse.json(
          { error: 'End date must be after start date', code: 'INVALID_DATE_RANGE' },
          { status: 400 }
        );
      }
    }

    // Validate maxAttendees if provided
    if (maxAttendees !== undefined && maxAttendees !== null) {
      if (typeof maxAttendees !== 'number' || maxAttendees < 0) {
        return NextResponse.json(
          { error: 'Max attendees must be a non-negative number', code: 'INVALID_MAX_ATTENDEES' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const insertData: any = {
      title: title.trim(),
      description: description.trim(),
      eventType,
      startDate,
      requiresAuth: requiresAuth ?? false,
      createdAt: new Date().toISOString(),
    };

    if (endDate) insertData.endDate = endDate;
    if (location) insertData.location = location.trim();
    if (maxAttendees !== undefined && maxAttendees !== null) insertData.maxAttendees = maxAttendees;
    if (imageUrl) insertData.imageUrl = imageUrl.trim();

    const newEvent = await db.insert(events).values(insertData).returning();

    return NextResponse.json(newEvent[0], { status: 201 });
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
    // Check authentication and permission
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const hasPermission = await checkPermission(session.user.id, 'update');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Permission denied: events.update required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if event exists
    const existingEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (existingEvent.length === 0) {
      return NextResponse.json(
        { error: 'Event not found', code: 'EVENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, eventType, startDate, endDate, location, maxAttendees, requiresAuth, imageUrl } = body;

    const updates: any = {};

    // Validate and update title
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    // Validate and update description
    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim().length === 0) {
        return NextResponse.json(
          { error: 'Description must be a non-empty string', code: 'INVALID_DESCRIPTION' },
          { status: 400 }
        );
      }
      updates.description = description.trim();
    }

    // Validate and update eventType
    if (eventType !== undefined) {
      if (!VALID_EVENT_TYPES.includes(eventType)) {
        return NextResponse.json(
          { 
            error: 'Invalid event type. Must be one of: workshop, service, outreach, meeting',
            code: 'INVALID_EVENT_TYPE' 
          },
          { status: 400 }
        );
      }
      updates.eventType = eventType;
    }

    // Validate and update startDate
    if (startDate !== undefined) {
      const startDateObj = new Date(startDate);
      if (isNaN(startDateObj.getTime())) {
        return NextResponse.json(
          { error: 'Start date must be a valid ISO timestamp', code: 'INVALID_START_DATE' },
          { status: 400 }
        );
      }
      updates.startDate = startDate;
    }

    // Validate and update endDate
    if (endDate !== undefined) {
      if (endDate === null) {
        updates.endDate = null;
      } else {
        const endDateObj = new Date(endDate);
        if (isNaN(endDateObj.getTime())) {
          return NextResponse.json(
            { error: 'End date must be a valid ISO timestamp', code: 'INVALID_END_DATE' },
            { status: 400 }
          );
        }

        const currentStartDate = updates.startDate || existingEvent[0].startDate;
        const currentStartDateObj = new Date(currentStartDate);
        
        if (endDateObj <= currentStartDateObj) {
          return NextResponse.json(
            { error: 'End date must be after start date', code: 'INVALID_DATE_RANGE' },
            { status: 400 }
          );
        }
        updates.endDate = endDate;
      }
    }

    // Validate and update location
    if (location !== undefined) {
      updates.location = location === null ? null : location.trim();
    }

    // Validate and update maxAttendees
    if (maxAttendees !== undefined) {
      if (maxAttendees !== null && (typeof maxAttendees !== 'number' || maxAttendees < 0)) {
        return NextResponse.json(
          { error: 'Max attendees must be a non-negative number', code: 'INVALID_MAX_ATTENDEES' },
          { status: 400 }
        );
      }
      updates.maxAttendees = maxAttendees;
    }

    // Update requiresAuth
    if (requiresAuth !== undefined) {
      updates.requiresAuth = requiresAuth;
    }

    // Update imageUrl
    if (imageUrl !== undefined) {
      updates.imageUrl = imageUrl === null ? null : imageUrl.trim();
    }

    const updatedEvent = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedEvent[0], { status: 200 });
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
    // Check authentication and permission
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const hasPermission = await checkPermission(session.user.id, 'delete');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Permission denied: events.delete required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if event exists
    const existingEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (existingEvent.length === 0) {
      return NextResponse.json(
        { error: 'Event not found', code: 'EVENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(events)
      .where(eq(events.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Event deleted successfully',
        event: deleted[0],
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