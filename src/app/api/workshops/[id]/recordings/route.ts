import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopRecordings, workshops } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshopId = params.id;

    // Validate workshopId
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID' 
        },
        { status: 400 }
      );
    }

    const parsedWorkshopId = parseInt(workshopId);

    // Verify workshop exists
    const workshop = await db
      .select()
      .from(workshops)
      .where(eq(workshops.id, parsedWorkshopId))
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

    // Get all recordings for this workshop
    const recordings = await db
      .select()
      .from(workshopRecordings)
      .where(eq(workshopRecordings.workshopId, parsedWorkshopId))
      .orderBy(desc(workshopRecordings.createdAt));

    return NextResponse.json(recordings, { status: 200 });
  } catch (error) {
    console.error('GET workshop recordings error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshopId = params.id;

    // Validate workshopId
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID' 
        },
        { status: 400 }
      );
    }

    const parsedWorkshopId = parseInt(workshopId);

    // Verify workshop exists
    const workshop = await db
      .select()
      .from(workshops)
      .where(eq(workshops.id, parsedWorkshopId))
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

    const body = await request.json();
    const { recordingUrl, duration, transcriptUrl } = body;

    // Validate required fields
    if (!recordingUrl) {
      return NextResponse.json(
        { 
          error: 'Recording URL is required',
          code: 'MISSING_RECORDING_URL' 
        },
        { status: 400 }
      );
    }

    // Validate recordingUrl is non-empty string
    if (typeof recordingUrl !== 'string' || recordingUrl.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Recording URL must be a non-empty string',
          code: 'INVALID_RECORDING_URL' 
        },
        { status: 400 }
      );
    }

    // Validate recordingUrl format
    try {
      new URL(recordingUrl.trim());
    } catch {
      return NextResponse.json(
        { 
          error: 'Recording URL must be a valid URL',
          code: 'INVALID_RECORDING_URL_FORMAT' 
        },
        { status: 400 }
      );
    }

    // Validate transcriptUrl if provided
    if (transcriptUrl !== undefined && transcriptUrl !== null) {
      if (typeof transcriptUrl !== 'string' || transcriptUrl.trim() === '') {
        return NextResponse.json(
          { 
            error: 'Transcript URL must be a non-empty string',
            code: 'INVALID_TRANSCRIPT_URL' 
          },
          { status: 400 }
        );
      }

      try {
        new URL(transcriptUrl.trim());
      } catch {
        return NextResponse.json(
          { 
            error: 'Transcript URL must be a valid URL',
            code: 'INVALID_TRANSCRIPT_URL_FORMAT' 
          },
          { status: 400 }
        );
      }
    }

    // Validate duration if provided
    if (duration !== undefined && duration !== null) {
      if (typeof duration !== 'number' || !Number.isInteger(duration) || duration <= 0) {
        return NextResponse.json(
          { 
            error: 'Duration must be a positive integer',
            code: 'INVALID_DURATION' 
          },
          { status: 400 }
        );
      }
    }

    // Create recording
    const newRecording = await db
      .insert(workshopRecordings)
      .values({
        workshopId: parsedWorkshopId,
        recordingUrl: recordingUrl.trim(),
        duration: duration || null,
        transcriptUrl: transcriptUrl ? transcriptUrl.trim() : null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newRecording[0], { status: 201 });
  } catch (error) {
    console.error('POST workshop recording error:', error);
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
    const recordingId = searchParams.get('recordingId');

    // Validate workshopId
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { 
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID' 
        },
        { status: 400 }
      );
    }

    // Validate recordingId is provided
    if (!recordingId) {
      return NextResponse.json(
        { 
          error: 'Recording ID is required',
          code: 'MISSING_RECORDING_ID' 
        },
        { status: 400 }
      );
    }

    // Validate recordingId is valid integer
    if (isNaN(parseInt(recordingId))) {
      return NextResponse.json(
        { 
          error: 'Valid recording ID is required',
          code: 'INVALID_RECORDING_ID' 
        },
        { status: 400 }
      );
    }

    const parsedWorkshopId = parseInt(workshopId);
    const parsedRecordingId = parseInt(recordingId);

    // Check if recording exists and belongs to the workshop
    const recording = await db
      .select()
      .from(workshopRecordings)
      .where(
        and(
          eq(workshopRecordings.id, parsedRecordingId),
          eq(workshopRecordings.workshopId, parsedWorkshopId)
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

    // Delete the recording
    const deleted = await db
      .delete(workshopRecordings)
      .where(
        and(
          eq(workshopRecordings.id, parsedRecordingId),
          eq(workshopRecordings.workshopId, parsedWorkshopId)
        )
      )
      .returning();

    return NextResponse.json(
      {
        message: 'Recording deleted successfully',
        recording: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE workshop recording error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}