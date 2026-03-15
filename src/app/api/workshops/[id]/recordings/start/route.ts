import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopRecordings, workshops } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate workshop ID is valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid workshop ID is required',
          code: 'INVALID_WORKSHOP_ID',
        },
        { status: 400 }
      );
    }

    const workshopId = parseInt(id);

    // Validate workshop exists
    const workshop = await db
      .select()
      .from(workshops)
      .where(eq(workshops.id, workshopId))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json(
        {
          error: 'Workshop not found',
          code: 'WORKSHOP_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { hostUserId, recordingUrl, duration, transcriptUrl } = body;

    // Validate hostUserId is provided
    if (!hostUserId || typeof hostUserId !== 'string' || hostUserId.trim() === '') {
      return NextResponse.json(
        {
          error: 'Host user ID is required',
          code: 'MISSING_HOST_USER_ID',
        },
        { status: 400 }
      );
    }

    // Validate hostUserId matches workshop host
    if (workshop[0].hostUserId !== hostUserId.trim()) {
      return NextResponse.json(
        {
          error: 'User is not authorized as workshop host',
          code: 'UNAUTHORIZED_HOST',
        },
        { status: 403 }
      );
    }

    // Validate recordingUrl is provided and non-empty
    if (!recordingUrl || typeof recordingUrl !== 'string' || recordingUrl.trim() === '') {
      return NextResponse.json(
        {
          error: 'Recording URL is required',
          code: 'MISSING_RECORDING_URL',
        },
        { status: 400 }
      );
    }

    // Validate duration if provided
    if (duration !== undefined && duration !== null) {
      if (typeof duration !== 'number' || !Number.isInteger(duration) || duration <= 0) {
        return NextResponse.json(
          {
            error: 'Duration must be a positive integer',
            code: 'INVALID_DURATION',
          },
          { status: 400 }
        );
      }
    }

    // Prepare recording data
    const recordingData: {
      workshopId: number;
      recordingUrl: string;
      duration?: number;
      transcriptUrl?: string;
      createdAt: string;
    } = {
      workshopId,
      recordingUrl: recordingUrl.trim(),
      createdAt: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (duration !== undefined && duration !== null) {
      recordingData.duration = duration;
    }

    if (transcriptUrl && typeof transcriptUrl === 'string' && transcriptUrl.trim() !== '') {
      recordingData.transcriptUrl = transcriptUrl.trim();
    }

    // Create recording record
    const newRecording = await db
      .insert(workshopRecordings)
      .values(recordingData)
      .returning();

    return NextResponse.json(newRecording[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}