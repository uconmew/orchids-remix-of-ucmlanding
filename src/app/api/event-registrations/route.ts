import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { eventRegistrations, events } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single registration by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const registration = await db
        .select()
        .from(eventRegistrations)
        .where(eq(eventRegistrations.id, parseInt(id)))
        .limit(1);

      if (registration.length === 0) {
        return NextResponse.json(
          { error: 'Registration not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(registration[0], { status: 200 });
    }

    // List registrations with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');

    let query = db.select().from(eventRegistrations);

    // Apply filters
    const conditions = [];
    if (eventId) {
      conditions.push(eq(eventRegistrations.eventId, parseInt(eventId)));
    }
    if (status) {
      conditions.push(eq(eventRegistrations.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(eventRegistrations.registeredAt))
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
    const { eventId, userName, userEmail, userPhone, notes, status, isMember } = body;

    // Validate required fields
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required', code: 'MISSING_EVENT_ID' },
        { status: 400 }
      );
    }

    if (!userName || userName.trim() === '') {
      return NextResponse.json(
        { error: 'User name is required', code: 'MISSING_USER_NAME' },
        { status: 400 }
      );
    }

    if (!userEmail || userEmail.trim() === '') {
      return NextResponse.json(
        { error: 'User email is required', code: 'MISSING_USER_EMAIL' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status. Must be one of: pending, confirmed, cancelled',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Validate event exists
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, parseInt(eventId)))
      .limit(1);

    if (event.length === 0) {
      return NextResponse.json(
        { error: 'Event not found', code: 'EVENT_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Create registration with member status
    const registrationData = {
      eventId: parseInt(eventId),
      userName: userName.trim(),
      userEmail: userEmail.trim().toLowerCase(),
      userPhone: userPhone ? userPhone.trim() : null,
      notes: isMember 
        ? `Ministry Member Registration. ${notes ? notes.trim() : ''}`.trim()
        : (notes ? notes.trim() : null),
      status: status || 'confirmed',
      registeredAt: new Date().toISOString(),
    };

    const newRegistration = await db
      .insert(eventRegistrations)
      .values(registrationData)
      .returning();

    return NextResponse.json({
      ...newRegistration[0],
      isMember: isMember === true
    }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if registration exists
    const existing = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Registration not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the registration
    const deleted = await db
      .delete(eventRegistrations)
      .where(eq(eventRegistrations.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Registration cancelled successfully',
        registration: deleted[0],
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