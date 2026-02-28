import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopVideos, workshops } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workshopId = searchParams.get('id');
    const videoId = searchParams.get('videoId');

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

    // Validate video ID
    if (!videoId || isNaN(parseInt(videoId))) {
      return NextResponse.json(
        { 
          error: 'Valid video ID is required',
          code: 'INVALID_VIDEO_ID'
        },
        { status: 400 }
      );
    }

    const parsedWorkshopId = parseInt(workshopId);
    const parsedVideoId = parseInt(videoId);

    // Parse request body
    const body = await request.json();
    const { hostUserId, currentTime, isPlaying } = body;

    // Validate hostUserId is provided
    if (!hostUserId) {
      return NextResponse.json(
        { 
          error: 'Host user ID is required',
          code: 'MISSING_HOST_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate currentTime
    if (currentTime === undefined || currentTime === null) {
      return NextResponse.json(
        { 
          error: 'Current time is required',
          code: 'MISSING_CURRENT_TIME'
        },
        { status: 400 }
      );
    }

    if (typeof currentTime !== 'number' || currentTime < 0) {
      return NextResponse.json(
        { 
          error: 'Current time must be a non-negative integer',
          code: 'INVALID_CURRENT_TIME'
        },
        { status: 400 }
      );
    }

    // Validate isPlaying
    if (isPlaying === undefined || isPlaying === null) {
      return NextResponse.json(
        { 
          error: 'isPlaying field is required',
          code: 'MISSING_IS_PLAYING'
        },
        { status: 400 }
      );
    }

    if (typeof isPlaying !== 'boolean') {
      return NextResponse.json(
        { 
          error: 'isPlaying must be a boolean',
          code: 'INVALID_IS_PLAYING'
        },
        { status: 400 }
      );
    }

    // Check if workshop exists
    const workshop = await db.select()
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

    // Verify user is workshop host
    if (workshop[0].hostUserId !== hostUserId) {
      return NextResponse.json(
        { 
          error: 'Only the workshop host can sync video playback',
          code: 'UNAUTHORIZED_HOST'
        },
        { status: 403 }
      );
    }

    // Check if video exists and belongs to this workshop
    const video = await db.select()
      .from(workshopVideos)
      .where(
        and(
          eq(workshopVideos.id, parsedVideoId),
          eq(workshopVideos.workshopId, parsedWorkshopId)
        )
      )
      .limit(1);

    if (video.length === 0) {
      return NextResponse.json(
        { 
          error: 'Video not found or does not belong to this workshop',
          code: 'VIDEO_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Update video playback state
    const updated = await db.update(workshopVideos)
      .set({
        currentTime: currentTime,
        isPlaying: isPlaying
      })
      .where(
        and(
          eq(workshopVideos.id, parsedVideoId),
          eq(workshopVideos.workshopId, parsedWorkshopId)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update video playback state',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}