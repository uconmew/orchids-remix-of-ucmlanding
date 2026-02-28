import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account, userRoles, roles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

/**
 * POST /api/admin/create-admin-user
 * Creates a new admin user with Executive Leadership role (Level 1 - Full Access)
 * 
 * This is a one-time setup endpoint. In production, this should be:
 * 1. Protected by environment variable or initial setup flag
 * 2. Disabled after first admin is created
 * 3. Only accessible during initial deployment
 */
export async function POST(request: NextRequest) {
  try {
    // Validate database connection is available at runtime
    if (!process.env.TURSO_CONNECTION_URL && !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database connection not configured. Please set TURSO_CONNECTION_URL or DATABASE_URL environment variable.' },
        { status: 500 }
      );
    }

    // Security: Check if this is allowed (you can add env check here)
    // Uncomment this in production to only allow during initial setup
    // const setupKey = request.headers.get('x-setup-key');
    // if (setupKey !== process.env.ADMIN_SETUP_KEY) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { email, name, password, staffTitle } = body;

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate unique user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user - use integer timestamps
    const now = new Date();
    const newUser = await db
      .insert(user)
      .values({
        id: userId,
        name,
        email,
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (newUser.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create account with password
    const accountId = `account_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await db.insert(account).values({
      id: accountId,
      accountId: userId,
      providerId: 'credential',
      userId: userId,
      password: hashedPassword,
      requiresPasswordChange: false,
      createdAt: now,
      updatedAt: now,
    });

    // Get Executive Leadership role (Level 1)
    const executiveRole = await db
      .select()
      .from(roles)
      .where(eq(roles.level, 1))
      .limit(1);

    if (executiveRole.length === 0) {
      return NextResponse.json(
        { error: 'Executive Leadership role not found in database. Please run database seeds.' },
        { status: 500 }
      );
    }

    // Assign Executive Leadership role
    const roleAssignment = await db
      .insert(userRoles)
      .values({
        userId: userId,
        roleId: executiveRole[0].id,
        staffTitle: staffTitle || 'Founding Visionary Lead',
        assignedAt: new Date().toISOString(),
        assignedBy: userId,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: 'Admin user created successfully with full access',
        user: {
          id: newUser[0].id,
          name: newUser[0].name,
          email: newUser[0].email,
          role: executiveRole[0].name,
          roleLevel: executiveRole[0].level,
          staffTitle: roleAssignment[0].staffTitle,
        },
        credentials: {
          email: email,
          note: 'Please save these credentials securely. The password cannot be retrieved later.',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}