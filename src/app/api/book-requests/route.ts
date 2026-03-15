import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookRequests, convicts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const convictId = searchParams.get('convictId');

    if (convictId) {
      const requests = await db
        .select()
        .from(bookRequests)
        .where(eq(bookRequests.convictId, parseInt(convictId)))
        .orderBy(desc(bookRequests.createdAt));

      return NextResponse.json(requests);
    }

    const requests = await db
      .select({
        request: bookRequests,
        convict: convicts,
      })
      .from(bookRequests)
      .innerJoin(convicts, eq(bookRequests.convictId, convicts.id))
      .orderBy(desc(bookRequests.createdAt))
      .limit(100);

    return NextResponse.json(requests.map(r => ({
      ...r.request,
      convictName: `${r.convict.firstName} ${r.convict.lastName}`,
      convictEmail: r.convict.email,
    })));
  } catch (error) {
    console.error('GET book requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { convictId, requestedBy, bookTitle, bookAuthor, resourceType, reason, notes } = body;

    if (!convictId || !bookTitle) {
      return NextResponse.json({ error: 'convictId and bookTitle are required' }, { status: 400 });
    }

    const convict = await db
      .select()
      .from(convicts)
      .where(eq(convicts.id, convictId))
      .limit(1);

    if (convict.length === 0) {
      return NextResponse.json({ error: 'Convict not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const newRequest = await db
      .insert(bookRequests)
      .values({
        convictId,
        requestedBy,
        bookTitle,
        bookAuthor,
        resourceType: resourceType || 'book',
        reason,
        notes,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newRequest[0], { status: 201 });
  } catch (error) {
    console.error('POST book request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
      if (status === 'fulfilled') {
        updateData.fulfilledAt = new Date().toISOString();
      }
    }
    if (notes !== undefined) updateData.notes = notes;

    const updated = await db
      .update(bookRequests)
      .set(updateData)
      .where(eq(bookRequests.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT book request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
