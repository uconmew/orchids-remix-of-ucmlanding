import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopParticipants } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const { id, participantId } = await params;
    const workshopId = parseInt(id);
    const body = await request.json();
    
    console.log('PATCH participant:', {
      workshopId,
      participantId,
      updates: body
    });

    // Build update object
    const updates: any = {};
    
    if (body.peerId !== undefined) {
      updates.peerId = body.peerId;
    }
    
    if (body.isMuted !== undefined) {
      updates.isMuted = body.isMuted;
    }
    
    if (body.isVideoOff !== undefined) {
      updates.isVideoOff = body.isVideoOff;
    }
    
    if (body.hasHandRaised !== undefined) {
      updates.hasHandRaised = body.hasHandRaised;
    }
    
    if (body.role !== undefined) {
      updates.role = body.role;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update participant
    const result = await db
      .update(workshopParticipants)
      .set(updates)
      .where(
        and(
          eq(workshopParticipants.workshopId, workshopId),
          eq(workshopParticipants.userId, participantId)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    console.log('✅ Participant updated:', result[0]);

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating participant:', error);
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    );
  }
}
