import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopRegistrations, workshops } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshopId = params.id;

    // Validate workshop ID
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_ID' },
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
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check workshop status
    const workshopData = workshop[0];
    if (workshopData.status === 'completed' || workshopData.status === 'cancelled') {
      return NextResponse.json(
        { 
          error: `Cannot register for ${workshopData.status} workshop`, 
          code: 'INVALID_WORKSHOP_STATUS' 
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { userId, userName, userEmail, notes } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!userName) {
      return NextResponse.json(
        { error: 'User name is required', code: 'MISSING_USER_NAME' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required', code: 'MISSING_USER_EMAIL' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Check if user already registered
    const existingRegistration = await db
      .select()
      .from(workshopRegistrations)
      .where(
        and(
          eq(workshopRegistrations.workshopId, parseInt(workshopId)),
          eq(workshopRegistrations.userId, userId),
          eq(workshopRegistrations.status, 'registered')
        )
      )
      .limit(1);

    if (existingRegistration.length > 0) {
      return NextResponse.json(
        { error: 'User already registered for this workshop', code: 'ALREADY_REGISTERED' },
        { status: 400 }
      );
    }

    // Check workshop capacity
    if (
      workshopData.maxParticipants !== null &&
      workshopData.currentParticipants >= workshopData.maxParticipants
    ) {
      return NextResponse.json(
        { error: 'Workshop is at maximum capacity', code: 'WORKSHOP_FULL' },
        { status: 400 }
      );
    }

    // Create registration
    const newRegistration = await db
      .insert(workshopRegistrations)
      .values({
        workshopId: parseInt(workshopId),
        userId,
        userName: userName.trim(),
        userEmail: userEmail.toLowerCase().trim(),
        notes: notes?.trim() || null,
        status: 'registered',
        registeredAt: new Date().toISOString(),
      })
      .returning();

    // Increment workshop participants count
    await db
      .update(workshops)
      .set({
        currentParticipants: workshopData.currentParticipants + 1,
      })
      .where(eq(workshops.id, parseInt(workshopId)));

    return NextResponse.json(newRegistration[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
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
    const workshopId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate workshop ID
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Validate userId parameter
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
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
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Find registration
    const registration = await db
      .select()
      .from(workshopRegistrations)
      .where(
        and(
          eq(workshopRegistrations.workshopId, parseInt(workshopId)),
          eq(workshopRegistrations.userId, userId),
          eq(workshopRegistrations.status, 'registered')
        )
      )
      .limit(1);

    if (registration.length === 0) {
      return NextResponse.json(
        { error: 'Registration not found or already cancelled', code: 'REGISTRATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update registration status to cancelled
    const cancelled = await db
      .update(workshopRegistrations)
      .set({
        status: 'cancelled',
      })
      .where(eq(workshopRegistrations.id, registration[0].id))
      .returning();

    // Decrement workshop participants count
    const workshopData = workshop[0];
    await db
      .update(workshops)
      .set({
        currentParticipants: Math.max(0, workshopData.currentParticipants - 1),
      })
      .where(eq(workshops.id, parseInt(workshopId)));

    return NextResponse.json({
      message: 'Registration cancelled successfully',
      data: cancelled[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}