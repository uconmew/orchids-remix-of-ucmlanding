import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopParticipants, workshops } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

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

    // Parse request body
    const body = await request.json();
    const { userId } = body;

    // Validate userId is provided
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID'
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

    // Find active participant (workshopId=id AND userId=userId AND leftAt IS NULL)
    const activeParticipant = await db.select()
      .from(workshopParticipants)
      .where(
        and(
          eq(workshopParticipants.workshopId, parseInt(workshopId)),
          eq(workshopParticipants.userId, userId),
          isNull(workshopParticipants.leftAt)
        )
      )
      .limit(1);

    if (activeParticipant.length === 0) {
      return NextResponse.json(
        { 
          error: 'Not currently in workshop session',
          code: 'PARTICIPANT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Update participant leftAt to current timestamp
    const updatedParticipant = await db.update(workshopParticipants)
      .set({
        leftAt: new Date().toISOString()
      })
      .where(eq(workshopParticipants.id, activeParticipant[0].id))
      .returning();

    return NextResponse.json(
      {
        message: 'Successfully left workshop session',
        participant: updatedParticipant[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/workshops/[id]/leave error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}