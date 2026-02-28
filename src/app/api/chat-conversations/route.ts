import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatConversations } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, role } = body;

    // Validation: sessionId is required and non-empty
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Session ID is required and must be a non-empty string',
          code: 'INVALID_SESSION_ID'
        },
        { status: 400 }
      );
    }

    // Validation: message is required and non-empty
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Message is required and must be a non-empty string',
          code: 'INVALID_MESSAGE'
        },
        { status: 400 }
      );
    }

    // Validation: role is required and must be 'user' or 'assistant'
    if (!role || (role !== 'user' && role !== 'assistant')) {
      return NextResponse.json(
        { 
          error: 'Role is required and must be either "user" or "assistant"',
          code: 'INVALID_ROLE'
        },
        { status: 400 }
      );
    }

    // Create new chat message
    const newMessage = await db.insert(chatConversations)
      .values({
        sessionId: sessionId.trim(),
        message: message.trim(),
        role,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newMessage[0], { status: 201 });

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    // Validation: sessionId query parameter is required
    if (!sessionId || sessionId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Session ID query parameter is required',
          code: 'MISSING_SESSION_ID'
        },
        { status: 400 }
      );
    }

    // Retrieve conversation history filtered by sessionId, ordered by createdAt ascending
    const messages = await db.select()
      .from(chatConversations)
      .where(eq(chatConversations.sessionId, sessionId.trim()))
      .orderBy(asc(chatConversations.createdAt))
      .all();

    return NextResponse.json(messages, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}