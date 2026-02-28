import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { convicts } from '@/db/schema';
import { eq, like, and, or, desc, sql, ne, isNull } from 'drizzle-orm';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_CONVICT_TYPES = [
  'workshop_participant',
  'outreach_participant',
  'ministry_volunteer',
  'newsletter_subscriber',
  'registered_user'
];

const VALID_CONVICT_ROLES = ['pastoral', 'outreach', 'volunteer', 'staff'];

const VALID_STATUSES = ['active', 'inactive', 'suspended'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const convict = await db
        .select()
        .from(convicts)
        .where(eq(convicts.id, parseInt(id)))
        .limit(1);

      if (convict.length === 0) {
        return NextResponse.json(
          { error: 'Convict not found', code: 'CONVICT_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(convict[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 500);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const convictType = searchParams.get('convictType');
    const convictRole = searchParams.get('convictRole');
    const status = searchParams.get('status');
    const city = searchParams.get('city');
    const phone = searchParams.get('phone');
    const address = searchParams.get('address');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const name = searchParams.get('name');

    let query = db.select().from(convicts);
    const conditions = [];

    // Always exclude staff from convict directory - staff are managed in Staff Management
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
          like(convicts.email, `%${search}%`),
          like(convicts.phone, `%${search}%`),
          like(convicts.address, `%${search}%`),
          like(convicts.city, `%${search}%`),
          like(convicts.userId, `%${search}%`),
          sql`CAST(${convicts.id} AS TEXT) LIKE ${`%${search}%`}`
        )
      );
    }

    if (name) {
      conditions.push(
        or(
          like(convicts.firstName, `%${name}%`),
          like(convicts.lastName, `%${name}%`)
        )
      );
    }

    if (email) {
      conditions.push(like(convicts.email, `%${email}%`));
    }

    if (phone) {
      conditions.push(like(convicts.phone, `%${phone}%`));
    }

    if (address) {
      conditions.push(like(convicts.address, `%${address}%`));
    }

    if (userId) {
      conditions.push(eq(convicts.userId, userId));
    }

    if (convictType) {
      conditions.push(eq(convicts.convictType, convictType));
    }

    if (convictRole) {
      conditions.push(eq(convicts.convictRole, convictRole));
    }

    if (status) {
      conditions.push(eq(convicts.status, status));
    }

    if (city) {
      conditions.push(like(convicts.city, `%${city}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(convicts.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(convicts)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json({
      data: results,
      total: Number(countResult[0]?.count || 0),
      limit,
      offset
    }, { status: 200 });
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
    const { firstName, lastName, email, phone, address, city, state, zipCode, convictType, convictRole, status, interests, notes } = body;

    if (!firstName) {
      return NextResponse.json(
        { error: 'First name is required', code: 'MISSING_FIRST_NAME' },
        { status: 400 }
      );
    }

    if (!lastName) {
      return NextResponse.json(
        { error: 'Last name is required', code: 'MISSING_LAST_NAME' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!convictType) {
      return NextResponse.json(
        { error: 'Convict type is required', code: 'MISSING_CONVICT_TYPE' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL_FORMAT' },
        { status: 400 }
      );
    }

    if (!VALID_CONVICT_TYPES.includes(convictType)) {
      return NextResponse.json(
        { error: 'Invalid convict type', code: 'INVALID_CONVICT_TYPE' },
        { status: 400 }
      );
    }

    if (convictRole && !VALID_CONVICT_ROLES.includes(convictRole)) {
      return NextResponse.json(
        { error: 'Invalid convict role', code: 'INVALID_CONVICT_ROLE' },
        { status: 400 }
      );
    }

    const providedStatus = status || 'active';
    if (!VALID_STATUSES.includes(providedStatus)) {
      return NextResponse.json(
        { error: 'Invalid status', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    const existingConvict = await db
      .select()
      .from(convicts)
      .where(eq(convicts.email, trimmedEmail))
      .limit(1);

    if (existingConvict.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists', code: 'EMAIL_EXISTS' },
        { status: 400 }
      );
    }

    let processedInterests = interests;
    if (interests) {
      if (typeof interests === 'string') {
        try {
          processedInterests = JSON.parse(interests);
        } catch {
          processedInterests = [interests];
        }
      }
    }

    const now = new Date().toISOString();

    const newConvict = await db
      .insert(convicts)
      .values({
        userId: null,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: trimmedEmail,
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null,
        city: city ? city.trim() : null,
        state: state ? state.trim() : null,
        zipCode: zipCode ? zipCode.trim() : null,
        convictType: convictType.trim(),
        convictRole: convictRole ? convictRole.trim() : null,
        status: providedStatus,
        interests: processedInterests,
        notes: notes ? notes.trim() : null,
        joinedAt: now,
        lastActivityAt: null,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newConvict[0], { status: 201 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(convicts)
      .where(eq(convicts.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Convict not found', code: 'CONVICT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, address, city, state, zipCode, convictType, convictRole, status, interests, notes, lastActivityAt } = body;

    const updates: any = {};

    if (firstName !== undefined) {
      updates.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      updates.lastName = lastName.trim();
    }

    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(trimmedEmail)) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL_FORMAT' },
          { status: 400 }
        );
      }

      const existingConvict = await db
        .select()
        .from(convicts)
        .where(eq(convicts.email, trimmedEmail))
        .limit(1);

      if (existingConvict.length > 0 && existingConvict[0].id !== parseInt(id)) {
        return NextResponse.json(
          { error: 'Email already exists', code: 'EMAIL_EXISTS' },
          { status: 400 }
        );
      }

      updates.email = trimmedEmail;
    }

    if (phone !== undefined) {
      updates.phone = phone ? phone.trim() : null;
    }

    if (address !== undefined) {
      updates.address = address ? address.trim() : null;
    }

    if (city !== undefined) {
      updates.city = city ? city.trim() : null;
    }

    if (state !== undefined) {
      updates.state = state ? state.trim() : null;
    }

    if (zipCode !== undefined) {
      updates.zipCode = zipCode ? zipCode.trim() : null;
    }

    if (convictType !== undefined) {
      if (!VALID_CONVICT_TYPES.includes(convictType)) {
        return NextResponse.json(
          { error: 'Invalid convict type', code: 'INVALID_CONVICT_TYPE' },
          { status: 400 }
        );
      }
      updates.convictType = convictType.trim();
    }

    if (convictRole !== undefined) {
      if (convictRole && !VALID_CONVICT_ROLES.includes(convictRole)) {
        return NextResponse.json(
          { error: 'Invalid convict role', code: 'INVALID_CONVICT_ROLE' },
          { status: 400 }
        );
      }
      updates.convictRole = convictRole ? convictRole.trim() : null;
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    if (interests !== undefined) {
      let processedInterests = interests;
      if (typeof interests === 'string') {
        try {
          processedInterests = JSON.parse(interests);
        } catch {
          processedInterests = [interests];
        }
      }
      updates.interests = processedInterests;
    }

    if (notes !== undefined) {
      updates.notes = notes ? notes.trim() : null;
    }

    if (lastActivityAt !== undefined) {
      updates.lastActivityAt = lastActivityAt;
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await db
      .update(convicts)
      .set(updates)
      .where(eq(convicts.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Convict not found', code: 'CONVICT_NOT_FOUND' },
        { status: 404 }
      );
    }

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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(convicts)
      .where(eq(convicts.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Convict not found', code: 'CONVICT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(convicts)
      .where(eq(convicts.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Convict not found', code: 'CONVICT_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Convict deleted successfully',
        convict: deleted[0]
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