import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { donations, donationSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, subscriptionId } = body;

    if (!paymentIntentId && !subscriptionId) {
      return NextResponse.json(
        { error: 'Payment intent ID or subscription ID is required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      await db
        .update(donations)
        .set({
          status: paymentIntent.status === 'succeeded' ? 'completed' : paymentIntent.status,
          updatedAt: now,
        })
        .where(eq(donations.stripePaymentIntentId, paymentIntentId));

      return NextResponse.json({
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        type: 'one_time',
      });
    }

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription & { current_period_start: number; current_period_end: number };
      
      await db
        .update(donationSubscriptions)
        .set({
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          updatedAt: now,
        })
        .where(eq(donationSubscriptions.stripeSubscriptionId, subscriptionId));

      return NextResponse.json({
        status: subscription.status,
        type: 'recurring',
      });
    }

    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  } catch (error) {
    console.error('Error confirming donation:', error);
    return NextResponse.json(
      { error: 'Failed to confirm donation' },
      { status: 500 }
    );
  }
}