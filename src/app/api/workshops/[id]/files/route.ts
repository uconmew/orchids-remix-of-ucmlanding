import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopFiles, workshops } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const workshopId = params.id;

    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_WORKSHOP_ID' },
        { status: 400 }
      );
    }

    // Verify workshop exists
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

    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('fileType');

    let query = db
      .select()
      .from(workshopFiles)
      .where(eq(workshopFiles.workshopId, parseInt(workshopId)))
      .orderBy(desc(workshopFiles.uploadedAt));

    if (fileType) {
      query = db
        .select()
        .from(workshopFiles)
        .where(
          and(
            eq(workshopFiles.workshopId, parseInt(workshopId)),
            eq(workshopFiles.fileType, fileType)
          )
        )
        .orderBy(desc(workshopFiles.uploadedAt));
    }

    const files = await query;

    return NextResponse.json(files, { status: 200 });
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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const workshopId = params.id;

    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_WORKSHOP_ID' },
        { status: 400 }
      );
    }

    // Verify workshop exists
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

    const body = await request.json();

    // Security check: reject if uploadedBy provided in body
    if ('uploadedBy' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { fileName, fileUrl, fileType, fileSize } = body;

    // Validate required fields
    if (!fileName || typeof fileName !== 'string' || fileName.trim() === '') {
      return NextResponse.json(
        { error: 'fileName is required and must be a non-empty string', code: 'MISSING_FILE_NAME' },
        { status: 400 }
      );
    }

    if (!fileUrl || typeof fileUrl !== 'string' || fileUrl.trim() === '') {
      return NextResponse.json(
        { error: 'fileUrl is required and must be a non-empty string', code: 'MISSING_FILE_URL' },
        { status: 400 }
      );
    }

    // Validate fileType if provided
    const validFileTypes = ['document', 'video', 'image', 'other'];
    if (fileType && !validFileTypes.includes(fileType)) {
      return NextResponse.json(
        {
          error: `fileType must be one of: ${validFileTypes.join(', ')}`,
          code: 'INVALID_FILE_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate fileSize if provided
    if (fileSize !== undefined && fileSize !== null && (typeof fileSize !== 'number' || fileSize < 0)) {
      return NextResponse.json(
        { error: 'fileSize must be a positive number', code: 'INVALID_FILE_SIZE' },
        { status: 400 }
      );
    }

    const newFile = await db
      .insert(workshopFiles)
      .values({
        workshopId: parseInt(workshopId),
        fileName: fileName.trim(),
        fileUrl: fileUrl.trim(),
        fileType: fileType || null,
        fileSize: fileSize || null,
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newFile[0], { status: 201 });
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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const workshopId = params.id;

    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_WORKSHOP_ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId || isNaN(parseInt(fileId))) {
      return NextResponse.json(
        { error: 'Valid fileId query parameter is required', code: 'INVALID_FILE_ID' },
        { status: 400 }
      );
    }

    // Check if file exists and belongs to the workshop
    const file = await db
      .select()
      .from(workshopFiles)
      .where(
        and(
          eq(workshopFiles.id, parseInt(fileId)),
          eq(workshopFiles.workshopId, parseInt(workshopId))
        )
      )
      .limit(1);

    if (file.length === 0) {
      return NextResponse.json(
        { error: 'File not found in this workshop', code: 'FILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(workshopFiles)
      .where(
        and(
          eq(workshopFiles.id, parseInt(fileId)),
          eq(workshopFiles.workshopId, parseInt(workshopId))
        )
      )
      .returning();

    return NextResponse.json(
      {
        message: 'File deleted successfully',
        file: deleted[0],
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