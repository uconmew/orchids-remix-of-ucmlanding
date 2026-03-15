import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { outreachRegistrations, convicts, notifications } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const registrations = await db
      .select()
      .from(outreachRegistrations)
      .where(eq(outreachRegistrations.userId, user.id))
      .orderBy(desc(outreachRegistrations.createdAt));

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Error fetching outreach registrations:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized - Please log in to register' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      serviceId, 
      notes,
      registrantName,
      registrantEmail,
      registrantPhone,
      termsAccepted,
      coComplianceAccepted,
      additionalInfo
    } = body;

    if (!serviceId) {
      return NextResponse.json({ error: 'Missing serviceId' }, { status: 400 });
    }

    if (!termsAccepted) {
      return NextResponse.json({ error: 'You must accept the terms of service' }, { status: 400 });
    }

    if (!coComplianceAccepted) {
      return NextResponse.json({ error: 'You must acknowledge Colorado compliance requirements' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(outreachRegistrations)
      .where(
        and(
          eq(outreachRegistrations.userId, currentUser.id),
          eq(outreachRegistrations.serviceId, serviceId),
          eq(outreachRegistrations.status, 'pending')
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: 'You already have a pending registration for this service' }, { status: 400 });
    }

    const convictRecord = await db
      .select()
      .from(convicts)
      .where(eq(convicts.userId, currentUser.id))
      .limit(1);

    const convictId = convictRecord.length > 0 ? convictRecord[0].id : null;

    const newRegistration = await db.insert(outreachRegistrations).values({
      userId: currentUser.id,
      convictId,
      serviceId,
      registrantName: registrantName || currentUser.name,
      registrantEmail: registrantEmail || currentUser.email,
      registrantPhone: registrantPhone || '',
      termsAccepted: true,
      coComplianceAccepted: true,
      additionalInfo: additionalInfo || null,
      notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    const serviceNames: Record<string, string> = {
      'nourish': 'UCON Nourish',
      'neighbors': 'UCON Neighbors',
      'voice': 'UCON Voice',
      'haven': 'UCON Haven',
      'steps': 'UCON Steps',
      'equip': 'UCON Equip',
      'awaken': 'UCON Awaken',
      'shepherd': 'UCON Shepherd',
      'bridge': 'UCON Bridge',
    };

    const serviceName = serviceNames[serviceId] || serviceId.toUpperCase();

    await db.insert(notifications).values({
      userId: currentUser.id,
      title: 'Registration Submitted',
      message: `Your registration for ${serviceName} has been submitted and is pending review. We'll notify you once it's been processed.`,
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(newRegistration[0]);
  } catch (error) {
    console.error('Error registering for outreach:', error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('id');

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(outreachRegistrations)
      .where(and(
        eq(outreachRegistrations.id, parseInt(registrationId)),
        eq(outreachRegistrations.userId, currentUser.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Registration not found or not authorized' }, { status: 404 });
    }

    if (existing[0].status !== 'pending') {
      return NextResponse.json({ error: 'Can only cancel pending registrations' }, { status: 400 });
    }

    await db
      .update(outreachRegistrations)
      .set({ 
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      })
      .where(eq(outreachRegistrations.id, parseInt(registrationId)));

    return NextResponse.json({ success: true, message: 'Registration cancelled' });
  } catch (error) {
    console.error('Error cancelling outreach registration:', error);
    return NextResponse.json({ error: 'Failed to cancel registration' }, { status: 500 });
  }
}
