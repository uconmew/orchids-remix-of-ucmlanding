import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopParticipants, workshops } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; participantId: string } }
) {
  try {
    const workshopId = params.id;
    const participantId = params.participantId;

    // Validate workshop ID and participant ID
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_WORKSHOP_ID' },
        { status: 400 }
      );
    }

    if (!participantId || isNaN(parseInt(participantId))) {
      return NextResponse.json(
        { error: 'Valid participant ID is required', code: 'INVALID_PARTICIPANT_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { hostUserId, isMuted } = body;

    // Validate required fields
    if (!hostUserId) {
      return NextResponse.json(
        { error: 'Host user ID is required', code: 'MISSING_HOST_USER_ID' },
        { status: 400 }
      );
    }

    if (typeof isMuted !== 'boolean') {
      return NextResponse.json(
        { error: 'isMuted must be a boolean value', code: 'INVALID_MUTED_STATUS' },
        { status: 400 }
      );
    }

    // Check if workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, parseInt(workshopId)))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify host authorization
    if (workshop[0].hostUserId !== hostUserId) {
      return NextResponse.json(
        { error: 'Only workshop host can control participant audio', code: 'UNAUTHORIZED_HOST' },
        { status: 403 }
      );
    }

    // Find active participant
    const participant = await db.select()
      .from(workshopParticipants)
      .where(
        and(
          eq(workshopParticipants.id, parseInt(participantId)),
          eq(workshopParticipants.workshopId, parseInt(workshopId)),
          isNull(workshopParticipants.leftAt)
        )
      )
      .limit(1);

    if (participant.length === 0) {
      return NextResponse.json(
        { error: 'Participant not found in session', code: 'PARTICIPANT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update participant mute status
    const updated = await db.update(workshopParticipants)
      .set({
        isMuted,
        updatedAt: new Date().toISOString()
      })
      .where(eq(workshopParticipants.id, parseInt(participantId)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; participantId: string } }
) {
  try {
    const workshopId = params.id;
    const participantId = params.participantId;

    // Validate workshop ID and participant ID
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_WORKSHOP_ID' },
        { status: 400 }
      );
    }

    if (!participantId || isNaN(parseInt(participantId))) {
      return NextResponse.json(
        { error: 'Valid participant ID is required', code: 'INVALID_PARTICIPANT_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { hostUserId, isMuted } = body;

    // Validate required fields
    if (!hostUserId) {
      return NextResponse.json(
        { error: 'Host user ID is required', code: 'MISSING_HOST_USER_ID' },
        { status: 400 }
      );
    }

    if (typeof isMuted !== 'boolean') {
      return NextResponse.json(
        { error: 'isMuted must be a boolean value', code: 'INVALID_MUTED_STATUS' },
        { status: 400 }
      );
    }

    // Check if workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, parseInt(workshopId)))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json(
        { error: 'Workshop not found', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify host authorization
    if (workshop[0].hostUserId !== hostUserId) {
      return NextResponse.json(
        { error: 'Only workshop host can control participant audio', code: 'UNAUTHORIZED_HOST' },
        { status: 403 }
      );
    }

    // Find active participant
    const participant = await db.select()
      .from(workshopParticipants)
      .where(
        and(
          eq(workshopParticipants.id, parseInt(participantId)),
          eq(workshopParticipants.workshopId, parseInt(workshopId)),
          isNull(workshopParticipants.leftAt)
        )
      )
      .limit(1);

    if (participant.length === 0) {
      return NextResponse.json(
        { error: 'Participant not found in session', code: 'PARTICIPANT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update participant mute status
    const updated = await db.update(workshopParticipants)
      .set({
        isMuted,
        updatedAt: new Date().toISOString()
      })
      .where(eq(workshopParticipants.id, parseInt(participantId)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}