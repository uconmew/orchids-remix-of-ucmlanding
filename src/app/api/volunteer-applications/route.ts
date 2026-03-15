import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { volunteerApplications } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

const VALID_AVAILABILITY = ['weekdays', 'weekends', 'both'];
const VALID_STATUS = ['pending', 'approved', 'rejected'];

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const application = await db
        .select()
        .from(volunteerApplications)
        .where(eq(volunteerApplications.id, parseInt(id)))
        .limit(1);

      if (application.length === 0) {
        return NextResponse.json(
          { error: 'Application not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(application[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let query = db.select().from(volunteerApplications);

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(volunteerApplications.firstName, `%${search}%`),
          like(volunteerApplications.lastName, `%${search}%`),
          like(volunteerApplications.email, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(volunteerApplications.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const results = await query
      .orderBy(desc(volunteerApplications.submittedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      availability,
      interests,
      experience,
      whyVolunteer,
      backgroundCheckConsent,
      status,
    } = body;

    if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
      return NextResponse.json(
        { error: 'First name is required', code: 'MISSING_FIRST_NAME' },
        { status: 400 }
      );
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
      return NextResponse.json(
        { error: 'Last name is required', code: 'MISSING_LAST_NAME' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      return NextResponse.json(
        { error: 'Phone is required', code: 'MISSING_PHONE' },
        { status: 400 }
      );
    }

    if (!whyVolunteer || typeof whyVolunteer !== 'string' || whyVolunteer.trim() === '') {
      return NextResponse.json(
        { error: 'Why volunteer is required', code: 'MISSING_WHY_VOLUNTEER' },
        { status: 400 }
      );
    }

    if (availability && !VALID_AVAILABILITY.includes(availability)) {
      return NextResponse.json(
        {
          error: `Availability must be one of: ${VALID_AVAILABILITY.join(', ')}`,
          code: 'INVALID_AVAILABILITY',
        },
        { status: 400 }
      );
    }

    const newApplication = await db
      .insert(volunteerApplications)
      .values({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address ? address.trim() : null,
        city: city ? city.trim() : null,
        state: state ? state.trim() : null,
        zipCode: zipCode ? zipCode.trim() : null,
        availability: availability || null,
        interests: interests || null,
        experience: experience ? experience.trim() : null,
        whyVolunteer: whyVolunteer.trim(),
        backgroundCheckConsent: backgroundCheckConsent === true ? true : false,
        status: status || 'pending',
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        notes: null,
      })
      .returning();

    return NextResponse.json(newApplication[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(volunteerApplications)
      .where(eq(volunteerApplications.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Application not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, reviewedAt, notes } = body;

    const updates: any = {};

    if (status !== undefined) {
      if (!VALID_STATUS.includes(status)) {
        return NextResponse.json(
          {
            error: `Status must be one of: ${VALID_STATUS.join(', ')}`,
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
      updates.status = status;

      if (
        (status === 'approved' || status === 'rejected') &&
        !existing[0].reviewedAt &&
        reviewedAt === undefined
      ) {
        updates.reviewedAt = new Date().toISOString();
      }
    }

    if (reviewedAt !== undefined) {
      updates.reviewedAt = reviewedAt;
    }

    if (notes !== undefined) {
      updates.notes = notes ? notes.trim() : null;
    }

    const updated = await db
      .update(volunteerApplications)
      .set(updates)
      .where(eq(volunteerApplications.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(volunteerApplications)
      .where(eq(volunteerApplications.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Application not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(volunteerApplications)
      .where(eq(volunteerApplications.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Application deleted successfully',
        application: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}