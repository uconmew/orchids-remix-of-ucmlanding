import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { newsletterSubscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/newsletter - Subscribe to newsletter
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, source = 'homepage_modal' } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Check if email already exists
    const existing = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      const subscriber = existing[0];
      
      // If they were previously unsubscribed, reactivate them
      if (subscriber.status === 'unsubscribed') {
        await db
          .update(newsletterSubscribers)
          .set({
            status: 'active',
            name: name,
            subscribedAt: now,
            unsubscribedAt: null,
            updatedAt: now,
          })
          .where(eq(newsletterSubscribers.id, subscriber.id));

        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
          subscriber: { id: subscriber.id, email: subscriber.email, name }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter!',
        subscriber: { id: subscriber.id, email: subscriber.email, name: subscriber.name }
      });
    }

    // Create new subscriber
    const result = await db.insert(newsletterSubscribers).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      status: 'active',
      subscribedAt: now,
      source,
      tags: JSON.stringify(['website']),
      emailsSent: 0,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      subscriber: {
        id: result[0].id,
        email: result[0].email,
        name: result[0].name,
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    
    // Handle unique constraint violation
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter!'
      });
    }

    return NextResponse.json(
      { error: 'Failed to process newsletter subscription', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/newsletter - Get all newsletter subscribers (admin only)
export async function GET(req: NextRequest) {
  try {
    const subscribers = await db
      .select({
        id: newsletterSubscribers.id,
        name: newsletterSubscribers.name,
        email: newsletterSubscribers.email,
        status: newsletterSubscribers.status,
        subscribedAt: newsletterSubscribers.subscribedAt,
        emailsSent: newsletterSubscribers.emailsSent,
        source: newsletterSubscribers.source,
      })
      .from(newsletterSubscribers)
      .orderBy(newsletterSubscribers.subscribedAt);

    return NextResponse.json({
      success: true,
      count: subscribers.length,
      subscribers,
    });

  } catch (error: any) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter subscribers', details: error.message },
      { status: 500 }
    );
  }
}
