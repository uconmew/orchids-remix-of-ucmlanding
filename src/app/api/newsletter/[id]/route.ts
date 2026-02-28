import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { newsletterSubscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/newsletter/[id] - Get specific subscriber
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid subscriber ID' },
        { status: 400 }
      );
    }

    const subscriber = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.id, id))
      .limit(1);

    if (subscriber.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subscriber: subscriber[0],
    });

  } catch (error: any) {
    console.error('Error fetching subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriber', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/newsletter/[id] - Update subscriber
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid subscriber ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, email, status, tags } = body;

    const now = new Date().toISOString();
    const updateData: any = {
      updatedAt: now,
    };

    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        );
      }
      updateData.email = email.toLowerCase().trim();
    }
    if (status !== undefined) {
      if (!['active', 'unsubscribed'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be "active" or "unsubscribed"' },
          { status: 400 }
        );
      }
      updateData.status = status;
      if (status === 'unsubscribed') {
        updateData.unsubscribedAt = now;
      } else {
        updateData.unsubscribedAt = null;
      }
    }
    if (tags !== undefined) {
      updateData.tags = JSON.stringify(tags);
    }

    const result = await db
      .update(newsletterSubscribers)
      .set(updateData)
      .where(eq(newsletterSubscribers.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscriber updated successfully',
      subscriber: result[0],
    });

  } catch (error: any) {
    console.error('Error updating subscriber:', error);
    
    // Handle unique constraint violation
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Email address is already in use' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update subscriber', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/newsletter/[id] - Delete subscriber permanently
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid subscriber ID' },
        { status: 400 }
      );
    }

    const result = await db
      .delete(newsletterSubscribers)
      .where(eq(newsletterSubscribers.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscriber deleted successfully',
    });

  } catch (error: any) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscriber', details: error.message },
      { status: 500 }
    );
  }
}
