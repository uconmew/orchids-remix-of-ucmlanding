import { NextRequest, NextResponse } from 'next/server';
import { createDonationPaymentIntent, DONATION_TIERS, DonationTier } from '@/lib/stripe';
import { db } from '@/db';
import { donations } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, email, name, isAnonymous, tier, message } = body;

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: 'Minimum donation amount is $1.00' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const tierInfo = tier && DONATION_TIERS[tier as DonationTier];
    const metadata: Record<string, string> = {
      tier: tier || 'custom',
      is_anonymous: isAnonymous ? 'true' : 'false',
    };
    if (message) metadata.message = message;

    const paymentIntent = await createDonationPaymentIntent(
      amount,
      'usd',
      email,
      isAnonymous ? undefined : name,
      metadata
    );

    const now = new Date().toISOString();
    
    try {
      await db.insert(donations).values({
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer as string,
        donorEmail: email,
        donorName: isAnonymous ? null : name,
        amount,
        currency: 'usd',
        donationType: 'one_time',
        tier: tier || 'custom',
        status: 'pending',
        isAnonymous: isAnonymous ?? false,
        message: message || null,
        createdAt: now,
        updatedAt: now,
      });
    } catch (dbError) {
      console.error('Database insert error:', dbError);
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create payment intent', details: errorMessage },
      { status: 500 }
    );
  }
}