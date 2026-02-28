import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { newsletterSubscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Find subscriber
    const existing = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email.toLowerCase()))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Email address not found in our newsletter list' },
        { status: 404 }
      );
    }

    const subscriber = existing[0];

    // Check if already unsubscribed
    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json({
        success: true,
        message: 'You are already unsubscribed from our newsletter.',
      });
    }

    // Update to unsubscribed
    await db
      .update(newsletterSubscribers)
      .set({
        status: 'unsubscribed',
        unsubscribedAt: now,
        updatedAt: now,
      })
      .where(eq(newsletterSubscribers.id, subscriber.id));

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter.',
    });

  } catch (error: any) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/newsletter/unsubscribe?email=xxx - Unsubscribe via link (for email)
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Find subscriber
    const existing = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email.toLowerCase()))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Email address not found in our newsletter list' },
        { status: 404 }
      );
    }

    const subscriber = existing[0];

    // Update to unsubscribed if not already
    if (subscriber.status !== 'unsubscribed') {
      await db
        .update(newsletterSubscribers)
        .set({
          status: 'unsubscribed',
          unsubscribedAt: now,
          updatedAt: now,
        })
        .where(eq(newsletterSubscribers.id, subscriber.id));
    }

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter.',
    });

  } catch (error: any) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request', details: error.message },
      { status: 500 }
    );
  }
}
