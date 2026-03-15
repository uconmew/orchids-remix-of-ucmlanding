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

    // Validate IDs are valid integers
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID' 
        },
        { status: 400 }
      );
    }

    if (!participantId || isNaN(parseInt(participantId))) {
      return NextResponse.json(
        { 
          error: 'Valid participant ID is required',
          code: 'INVALID_PARTICIPANT_ID' 
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { hostUserId, isVideoOff } = body;

    // Validate required fields
    if (!hostUserId) {
      return NextResponse.json(
        { 
          error: 'hostUserId is required',
          code: 'MISSING_HOST_USER_ID' 
        },
        { status: 400 }
      );
    }

    if (typeof isVideoOff !== 'boolean') {
      return NextResponse.json(
        { 
          error: 'isVideoOff must be a boolean',
          code: 'INVALID_VIDEO_STATUS' 
        },
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
        { 
          error: 'Workshop not found',
          code: 'WORKSHOP_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Verify hostUserId matches workshop.hostUserId
    if (workshop[0].hostUserId !== hostUserId) {
      return NextResponse.json(
        { 
          error: 'Only workshop host can control participant video',
          code: 'UNAUTHORIZED_HOST' 
        },
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
        { 
          error: 'Participant not found in session',
          code: 'PARTICIPANT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Update participant video status
    const updated = await db.update(workshopParticipants)
      .set({
        isVideoOff,
        updatedAt: new Date().toISOString()
      })
      .where(
        and(
          eq(workshopParticipants.id, parseInt(participantId)),
          eq(workshopParticipants.workshopId, parseInt(workshopId)),
          isNull(workshopParticipants.leftAt)
        )
      )
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
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

    // Validate IDs are valid integers
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID' 
        },
        { status: 400 }
      );
    }

    if (!participantId || isNaN(parseInt(participantId))) {
      return NextResponse.json(
        { 
          error: 'Valid participant ID is required',
          code: 'INVALID_PARTICIPANT_ID' 
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { hostUserId, isVideoOff } = body;

    // Validate required fields
    if (!hostUserId) {
      return NextResponse.json(
        { 
          error: 'hostUserId is required',
          code: 'MISSING_HOST_USER_ID' 
        },
        { status: 400 }
      );
    }

    if (typeof isVideoOff !== 'boolean') {
      return NextResponse.json(
        { 
          error: 'isVideoOff must be a boolean',
          code: 'INVALID_VIDEO_STATUS' 
        },
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
        { 
          error: 'Workshop not found',
          code: 'WORKSHOP_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Verify hostUserId matches workshop.hostUserId
    if (workshop[0].hostUserId !== hostUserId) {
      return NextResponse.json(
        { 
          error: 'Only workshop host can control participant video',
          code: 'UNAUTHORIZED_HOST' 
        },
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
        { 
          error: 'Participant not found in session',
          code: 'PARTICIPANT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Update participant video status
    const updated = await db.update(workshopParticipants)
      .set({
        isVideoOff,
        updatedAt: new Date().toISOString()
      })
      .where(
        and(
          eq(workshopParticipants.id, parseInt(participantId)),
          eq(workshopParticipants.workshopId, parseInt(workshopId)),
          isNull(workshopParticipants.leftAt)
        )
      )
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
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