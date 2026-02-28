import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { donations, donationSubscriptions } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');

    if (type === 'one_time') {
      const donationsList = await db
        .select()
        .from(donations)
        .orderBy(desc(donations.createdAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json({ donations: donationsList });
    }

    if (type === 'recurring') {
      const subscriptionsList = await db
        .select()
        .from(donationSubscriptions)
        .orderBy(desc(donationSubscriptions.createdAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json({ subscriptions: subscriptionsList });
    }

    let donationsList: unknown[] = [];
    let subscriptionsList: unknown[] = [];

    try {
      donationsList = await db
        .select()
        .from(donations)
        .orderBy(desc(donations.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (e) {
      console.error('Error fetching donations:', e);
    }

    try {
      subscriptionsList = await db
        .select()
        .from(donationSubscriptions)
        .orderBy(desc(donationSubscriptions.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (e) {
      console.error('Error fetching subscriptions:', e);
    }

    return NextResponse.json({
      donations: donationsList,
      subscriptions: subscriptionsList,
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations', donations: [], subscriptions: [] },
      { status: 200 }
    );
  }
}