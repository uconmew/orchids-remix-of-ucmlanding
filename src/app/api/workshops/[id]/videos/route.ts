import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopVideos, workshops } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(
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

    const id = parseInt(workshopId);

    // Validate workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, id))
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

    // Get all videos for this workshop, ordered by newest first
    const videos = await db.select()
      .from(workshopVideos)
      .where(eq(workshopVideos.workshopId, id))
      .orderBy(desc(workshopVideos.uploadedAt));

    return NextResponse.json(videos, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
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

    const id = parseInt(workshopId);

    // Validate workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, id))
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
    const { title, videoUrl, uploadedBy, durationSeconds } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Title is required and must be a non-empty string',
          code: 'MISSING_TITLE' 
        },
        { status: 400 }
      );
    }

    if (!videoUrl || typeof videoUrl !== 'string' || videoUrl.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Video URL is required and must be a non-empty string',
          code: 'MISSING_VIDEO_URL' 
        },
        { status: 400 }
      );
    }

    if (!uploadedBy || typeof uploadedBy !== 'string' || uploadedBy.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Uploaded by is required',
          code: 'MISSING_UPLOADED_BY' 
        },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(videoUrl.trim());
    } catch {
      return NextResponse.json(
        { 
          error: 'Invalid video URL format',
          code: 'INVALID_VIDEO_URL' 
        },
        { status: 400 }
      );
    }

    // Validate uploadedBy matches workshop host (host authorization)
    if (uploadedBy.trim() !== workshop[0].hostUserId) {
      return NextResponse.json(
        { 
          error: 'Only the workshop host can upload videos',
          code: 'UNAUTHORIZED_HOST' 
        },
        { status: 403 }
      );
    }

    // Prepare video data
    const videoData = {
      workshopId: id,
      title: title.trim(),
      videoUrl: videoUrl.trim(),
      uploadedBy: uploadedBy.trim(),
      durationSeconds: durationSeconds && typeof durationSeconds === 'number' ? durationSeconds : null,
      currentTime: 0,
      isPlaying: false,
      uploadedAt: new Date().toISOString(),
    };

    // Insert video
    const newVideo = await db.insert(workshopVideos)
      .values(videoData)
      .returning();

    return NextResponse.json(newVideo[0], { status: 201 });

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
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get('videoId');
    const hostUserId = searchParams.get('hostUserId');

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

    // Validate host user ID
    if (!hostUserId || hostUserId.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Host user ID is required for authorization',
          code: 'MISSING_HOST_USER_ID' 
        },
        { status: 400 }
      );
    }

    const id = parseInt(workshopId);
    const vId = parseInt(videoId);

    // Validate workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, id))
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

    // Validate hostUserId matches workshop host (host authorization)
    if (hostUserId.trim() !== workshop[0].hostUserId) {
      return NextResponse.json(
        { 
          error: 'Only the workshop host can delete videos',
          code: 'UNAUTHORIZED_HOST' 
        },
        { status: 403 }
      );
    }

    // Validate video exists and belongs to this workshop
    const video = await db.select()
      .from(workshopVideos)
      .where(
        and(
          eq(workshopVideos.id, vId),
          eq(workshopVideos.workshopId, id)
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

    // Delete the video
    const deleted = await db.delete(workshopVideos)
      .where(
        and(
          eq(workshopVideos.id, vId),
          eq(workshopVideos.workshopId, id)
        )
      )
      .returning();

    return NextResponse.json(
      {
        message: 'Video deleted successfully',
        video: deleted[0]
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