import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopRecordings, workshops } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const recordingId = searchParams.get('recordingId');

    // Validate workshop ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID' 
        },
        { status: 400 }
      );
    }

    // Validate recording ID
    if (!recordingId || isNaN(parseInt(recordingId))) {
      return NextResponse.json(
        { 
          error: 'Valid recording ID is required',
          code: 'INVALID_RECORDING_ID' 
        },
        { status: 400 }
      );
    }

    const requestBody = await request.json();
    const { hostUserId, duration, transcriptUrl, recordingUrl } = requestBody;

    // Validate hostUserId is provided
    if (!hostUserId || typeof hostUserId !== 'string' || hostUserId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Host user ID is required',
          code: 'MISSING_HOST_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate duration if provided
    if (duration !== undefined && duration !== null) {
      if (typeof duration !== 'number' || duration <= 0 || !Number.isInteger(duration)) {
        return NextResponse.json(
          { 
            error: 'Duration must be a positive integer',
            code: 'INVALID_DURATION' 
          },
          { status: 400 }
        );
      }
    }

    const workshopIdInt = parseInt(id);
    const recordingIdInt = parseInt(recordingId);

    // Verify workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, workshopIdInt))
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

    // Verify user is the workshop host
    if (workshop[0].hostUserId !== hostUserId.trim()) {
      return NextResponse.json(
        { 
          error: 'Only the workshop host can stop recording',
          code: 'UNAUTHORIZED_HOST' 
        },
        { status: 403 }
      );
    }

    // Verify recording exists and belongs to this workshop
    const recording = await db.select()
      .from(workshopRecordings)
      .where(
        and(
          eq(workshopRecordings.id, recordingIdInt),
          eq(workshopRecordings.workshopId, workshopIdInt)
        )
      )
      .limit(1);

    if (recording.length === 0) {
      return NextResponse.json(
        { 
          error: 'Recording not found or does not belong to this workshop',
          code: 'RECORDING_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      duration?: number;
      transcriptUrl?: string;
      recordingUrl?: string;
    } = {};

    if (duration !== undefined && duration !== null) {
      updateData.duration = duration;
    }

    if (transcriptUrl !== undefined && transcriptUrl !== null) {
      updateData.transcriptUrl = typeof transcriptUrl === 'string' ? transcriptUrl.trim() : transcriptUrl;
    }

    if (recordingUrl !== undefined && recordingUrl !== null) {
      updateData.recordingUrl = typeof recordingUrl === 'string' ? recordingUrl.trim() : recordingUrl;
    }

    // Update recording
    const updatedRecording = await db.update(workshopRecordings)
      .set(updateData)
      .where(
        and(
          eq(workshopRecordings.id, recordingIdInt),
          eq(workshopRecordings.workshopId, workshopIdInt)
        )
      )
      .returning();

    if (updatedRecording.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update recording',
          code: 'UPDATE_FAILED' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Recording stopped successfully',
      recording: updatedRecording[0]
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}