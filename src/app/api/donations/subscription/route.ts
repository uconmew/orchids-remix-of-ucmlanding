import { NextRequest, NextResponse } from 'next/server';
import { createDonationSubscription, DONATION_TIERS, DonationTier } from '@/lib/stripe';
import { db } from '@/db';
import { donationSubscriptions } from '@/db/schema';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, email, name, isAnonymous, tier, interval = 'month' } = body;

    if (!amount || amount < 500) {
      return NextResponse.json(
        { error: 'Minimum recurring donation amount is $5.00' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!['month', 'year'].includes(interval)) {
      return NextResponse.json(
        { error: 'Invalid interval. Must be "month" or "year"' },
        { status: 400 }
      );
    }

    const metadata: Record<string, string> = {
      tier: tier || 'custom',
      is_anonymous: isAnonymous ? 'true' : 'false',
    };

    const { subscription, clientSecret } = await createDonationSubscription(
      amount,
      interval as 'month' | 'year',
      email,
      isAnonymous ? undefined : name,
      metadata
    );

    const sub = subscription as Stripe.Subscription & { current_period_start: number; current_period_end: number };
    const now = new Date().toISOString();
    
    try {
      await db.insert(donationSubscriptions).values({
        stripeSubscriptionId: sub.id,
        stripeCustomerId: sub.customer as string,
        stripePriceId: sub.items.data[0].price.id,
        donorEmail: email,
        donorName: isAnonymous ? null : name,
        amount,
        currency: 'usd',
        interval,
        tier: tier || 'custom',
        status: sub.status,
        isAnonymous: isAnonymous ?? false,
        currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        createdAt: now,
        updatedAt: now,
      });
    } catch (dbError) {
      console.error('Database insert error:', dbError);
    }

    return NextResponse.json({
      clientSecret,
      subscriptionId: sub.id,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create subscription', details: errorMessage },
      { status: 500 }
    );
  }
}