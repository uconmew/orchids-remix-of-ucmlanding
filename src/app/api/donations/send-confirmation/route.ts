import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { DonationConfirmationEmail } from '@/emails/donation-confirmation';
import { createElement } from 'react';

export async function POST(request: NextRequest) {
  try {
    // Check for API key at runtime
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set - email sending is disabled');
      return NextResponse.json(
        { success: false, error: 'Email service not configured', code: 'EMAIL_DISABLED' },
        { status: 503 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await request.json();
    const {
      donorName,
      donorEmail,
      amount,
      donationType,
      interval,
      tier,
      transactionId,
      isAnonymous,
    } = body;

    if (!donorEmail || !amount || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const donationDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const { data, error } = await resend.emails.send({
      from: 'UCon Ministries <donations@uconministries.org>',
      to: [donorEmail],
      subject: `Thank you for your ${donationType === 'recurring' ? 'recurring ' : ''}donation to UCon Ministries!`,
      react: createElement(DonationConfirmationEmail, {
        donorName: donorName || 'Valued Donor',
        donorEmail,
        amount,
        donationType,
        interval,
        tier,
        transactionId,
        donationDate,
        isAnonymous: isAnonymous || false,
      }),
    });

    if (error) {
      console.error('Error sending donation confirmation email:', error);
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error('Error in send-confirmation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}