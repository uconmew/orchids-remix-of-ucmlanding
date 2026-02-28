import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopChatMessages, workshops } from '@/db/schema';
import { eq, and, or, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshopId = params.id;

    // Validate workshopId is valid integer
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
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 500);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const messageType = searchParams.get('messageType');
    const userId = searchParams.get('userId');

    // Build query conditions
    const conditions = [eq(workshopChatMessages.workshopId, parseInt(workshopId))];

    // Filter by messageType if provided
    if (messageType) {
      if (messageType !== 'public' && messageType !== 'private') {
        return NextResponse.json(
          { 
            error: 'Invalid messageType. Must be "public" or "private"', 
            code: 'INVALID_MESSAGE_TYPE' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(workshopChatMessages.messageType, messageType));
    }

    // For private messages with userId filter: return messages where userId=userId OR recipientId=userId
    if (userId && messageType === 'private') {
      const privateMessageCondition = or(
        eq(workshopChatMessages.userId, userId),
        eq(workshopChatMessages.recipientId, userId)
      );
      conditions.push(privateMessageCondition);
    } else if (userId && !messageType) {
      // If userId provided without messageType, filter by userId only
      conditions.push(eq(workshopChatMessages.userId, userId));
    }

    const messages = await db
      .select()
      .from(workshopChatMessages)
      .where(and(...conditions))
      .orderBy(asc(workshopChatMessages.sentAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(messages, { status: 200 });
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

    // Validate workshopId is valid integer
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
    const { userId, message, messageType = 'public', recipientId } = body;

    // Validate required fields
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Valid message is required', code: 'MISSING_MESSAGE' },
        { status: 400 }
      );
    }

    // Validate messageType
    if (messageType !== 'public' && messageType !== 'private') {
      return NextResponse.json(
        { 
          error: 'messageType must be either "public" or "private"', 
          code: 'INVALID_MESSAGE_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate private message requirements
    if (messageType === 'private' && (!recipientId || recipientId.trim() === '')) {
      return NextResponse.json(
        { 
          error: 'recipientId is required for private messages', 
          code: 'MISSING_RECIPIENT_ID' 
        },
        { status: 400 }
      );
    }

    // Validate public message requirements
    if (messageType === 'public' && recipientId !== null && recipientId !== undefined) {
      return NextResponse.json(
        { 
          error: 'recipientId must be null for public messages', 
          code: 'INVALID_RECIPIENT_FOR_PUBLIC' 
        },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData = {
      workshopId: parseInt(workshopId),
      userId: userId.trim(),
      message: message.trim(),
      messageType,
      recipientId: messageType === 'private' ? recipientId.trim() : null,
      sentAt: new Date().toISOString(),
    };

    const newMessage = await db
      .insert(workshopChatMessages)
      .values(insertData)
      .returning();

    return NextResponse.json(newMessage[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}