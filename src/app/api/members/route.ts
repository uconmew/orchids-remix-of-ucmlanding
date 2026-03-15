import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { convicts } from '@/db/schema';
import { eq, like, and, or, desc, ne, isNull } from 'drizzle-orm';

const VALID_MEMBER_TYPES = [
  'workshop_participant',
  'outreach_participant',
  'ministry_volunteer',
  'newsletter_subscriber',
  'registered_user',
  'Convict',
  'Convict Volunteer'
];

const VALID_STATUSES = ['active', 'inactive', 'suspended'];

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const member = await db
        .select()
        .from(convicts)
        .where(eq(convicts.id, parseInt(id)))
        .limit(1);

      if (member.length === 0) {
        return NextResponse.json(
          { error: 'Member not found', code: 'MEMBER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(member[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const memberType = searchParams.get('memberType');
    const status = searchParams.get('status');
    const city = searchParams.get('city');

    let query = db.select().from(convicts);
    const conditions = [];

    // Always exclude staff from member directory
    conditions.push(
      or(
        ne(convicts.convictRole, 'staff'),
        isNull(convicts.convictRole)
      )
    );

    if (search) {
      conditions.push(
        or(
          like(convicts.firstName, `%${search}%`),
          like(convicts.lastName, `%${search}%`),
          like(convicts.email, `%${search}%`)
        )
      );
    }

    if (memberType) {
      conditions.push(eq(convicts.convictType, memberType));
    }

    if (status) {
      conditions.push(eq(convicts.status, status));
    }

    if (city) {
      conditions.push(eq(convicts.city, city));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(convicts.createdAt))
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
    const { firstName, lastName, email, phone, address, city, state, zipCode, memberType, status, interests, notes, joinedAt } = body;

    if (!firstName || !firstName.trim()) {
      return NextResponse.json(
        { error: 'First name is required', code: 'MISSING_FIRST_NAME' },
        { status: 400 }
      );
    }

    if (!lastName || !lastName.trim()) {
      return NextResponse.json(
        { error: 'Last name is required', code: 'MISSING_LAST_NAME' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!validateEmail(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL_FORMAT' },
        { status: 400 }
      );
    }

    if (!memberType || !memberType.trim()) {
      return NextResponse.json(
        { error: 'Member type is required', code: 'MISSING_MEMBER_TYPE' },
        { status: 400 }
      );
    }

    if (!VALID_MEMBER_TYPES.includes(memberType)) {
      return NextResponse.json(
        {
          error: `Invalid member type. Must be one of: ${VALID_MEMBER_TYPES.join(', ')}`,
          code: 'INVALID_MEMBER_TYPE'
        },
        { status: 400 }
      );
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingMember = await db
      .select()
      .from(convicts)
      .where(eq(convicts.email, normalizedEmail))
      .limit(1);

    if (existingMember.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists', code: 'EMAIL_EXISTS' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newMember = await db
      .insert(convicts)
      .values({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        zipCode: zipCode?.trim() || null,
        convictType: memberType.trim(),
        status: status?.trim() || 'active',
        interests: interests || null,
        notes: notes?.trim() || null,
        joinedAt: joinedAt || now,
        lastActivityAt: null,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newMember[0], { status: 201 });
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

    const existingMember = await db
      .select()
      .from(convicts)
      .where(eq(convicts.id, parseInt(id)))
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json(
        { error: 'Member not found', code: 'MEMBER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, address, city, state, zipCode, memberType, status, interests, notes, lastActivityAt } = body;

    if (email && !validateEmail(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL_FORMAT' },
        { status: 400 }
      );
    }

    if (email && email.trim().toLowerCase() !== existingMember[0].email) {
      const normalizedEmail = email.trim().toLowerCase();
      const emailExists = await db
        .select()
        .from(convicts)
        .where(eq(convicts.email, normalizedEmail))
        .limit(1);

      if (emailExists.length > 0) {
        return NextResponse.json(
          { error: 'Email already exists', code: 'EMAIL_EXISTS' },
          { status: 400 }
        );
      }
    }

    if (memberType && !VALID_MEMBER_TYPES.includes(memberType)) {
      return NextResponse.json(
        {
          error: `Invalid member type. Must be one of: ${VALID_MEMBER_TYPES.join(', ')}`,
          code: 'INVALID_MEMBER_TYPE'
        },
        { status: 400 }
      );
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (firstName !== undefined) updates.firstName = firstName.trim();
    if (lastName !== undefined) updates.lastName = lastName.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone?.trim() || null;
    if (address !== undefined) updates.address = address?.trim() || null;
    if (city !== undefined) updates.city = city?.trim() || null;
    if (state !== undefined) updates.state = state?.trim() || null;
    if (zipCode !== undefined) updates.zipCode = zipCode?.trim() || null;
    if (memberType !== undefined) updates.convictType = memberType.trim();
    if (status !== undefined) updates.status = status.trim();
    if (interests !== undefined) {
      if (Array.isArray(interests)) {
        updates.interests = JSON.stringify(interests);
      } else if (typeof interests === 'string') {
        updates.interests = interests;
      } else {
        updates.interests = interests;
      }
    }
    if (notes !== undefined) updates.notes = notes?.trim() || null;
    if (lastActivityAt !== undefined) updates.lastActivityAt = lastActivityAt;

    const updatedMember = await db
      .update(convicts)
      .set(updates)
      .where(eq(convicts.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedMember[0], { status: 200 });
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

    const existingMember = await db
      .select()
      .from(convicts)
      .where(eq(convicts.id, parseInt(id)))
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json(
        { error: 'Member not found', code: 'MEMBER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(convicts)
      .where(eq(convicts.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Member deleted successfully',
        member: deleted[0]
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