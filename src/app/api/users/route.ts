import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { like, or, asc, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const me = searchParams.get('me');

    // If ?me=true, return current user with requiresPasswordChange status
    if (me === 'true') {
      const currentUser = await getCurrentUser(request);
      
      if (!currentUser) {
        return NextResponse.json(
          { error: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
          { status: 401 }
        );
      }

      // Query user with account information
      const userWithAccount = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          registrationNumber: user.registrationNumber,
          requiresPasswordChange: account.requiresPasswordChange,
        })
        .from(user)
        .leftJoin(account, eq(user.id, account.userId))
        .where(eq(user.id, currentUser.id))
        .limit(1);

      if (userWithAccount.length === 0) {
        return NextResponse.json(
          { error: 'User not found', code: 'USER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(userWithAccount[0], { status: 200 });
    }

    // Original list users functionality
    let query = db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        registrationNumber: user.registrationNumber,
      })
      .from(user);

    if (search) {
      query = query.where(
        or(
          like(user.name, `%${search}%`),
          like(user.email, `%${search}%`)
        )
      );
    }

    const users = await query.orderBy(asc(user.name));

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    // Use better-auth's signUp to create user with proper password hashing
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (!result || !result.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/users error:', error);
    const errorMessage = (error as Error).message || 'Internal server error';
    
    // Check for duplicate email error
    if (errorMessage.includes('unique') || errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }
    
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  }

// Non-sensitive profile field updates (address, phone, department, etc.)
const NON_SENSITIVE_FIELDS = [
  'phone', 'address', 'city', 'state', 'zipCode', 'department',
  'ministryPhone', 'hasDevice', 'compensationType', 'backgroundCheckDate',
  'referencesInfo', 'enrollmentDate', 'bio', 'gender', 'race',
  'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation',
  'vehicle', 'linkedin', 'image',
];

// Sensitive fields that require approval workflow
const SENSITIVE_FIELDS = ['name', 'email', 'ucmEmployeeNumber', 'registrationNumber'];

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    const sensitiveChanges: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(body)) {
      if (NON_SENSITIVE_FIELDS.includes(key)) {
        updates[key] = value;
      } else if (SENSITIVE_FIELDS.includes(key)) {
        sensitiveChanges[key] = value;
      }
    }

    if (Object.keys(sensitiveChanges).length > 0) {
      return NextResponse.json({
        error: 'Sensitive fields require approval workflow',
        sensitiveFields: Object.keys(sensitiveChanges),
        code: 'SENSITIVE_FIELDS_DETECTED',
      }, { status: 400 });
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updates.updatedAt = new Date();

    const [updated] = await db.update(user).set(updates).where(eq(user.id, userId)).returning();

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT /api/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
